import mongoose from 'mongoose'
import Checklist from '../models/checklist.model.js'
import Session from '../models/session.model.js'
import { USE_MONGODB } from '../commons/config.js'

// Standard-Checkliste für den Anwendungsfall "Schule/Universität".
const DEFAULT_ITEMS = [
  { label: 'Keys', code: 'KEYS' },
  { label: 'Student card', code: 'CARD' },
  { label: 'Laptop', code: 'LAPT' },
  { label: 'Charger', code: 'CHAR' },
]

// Für Tests ohne lokale MongoDB werden die Daten temporär im Speicher gehalten.
const memory = {
  checklist: null,
  currentSession: null,
  history: [],
}

function makeMemoryId() {
  return new mongoose.Types.ObjectId().toString()
}

// Mongoose-Dokumente und normale JavaScript-Objekte werden auf dasselbe Format gebracht.
function toPlain(value) {
  if (!value) return null
  return typeof value.toObject === 'function' ? value.toObject() : structuredClone(value)
}

// Berechnet den aktuellen Zustand für Frontend und ESP32-Anzeige.
// Solange Einträge fehlen, wird die Anzahl vierstellig angezeigt.
function summarize(sessionLike) {
  const session = toPlain(sessionLike)
  if (!session) return null

  const missingItems = session.items.filter((item) => !item.checked)
  const missingCount = missingItems.length
  let display = String(missingCount).padStart(4, '0')

  if (session.doorOpened && missingCount > 0) {
    display = 'MISS'
    session.status = 'alert'
  } else if (missingCount === 0) {
    display = 'DONE'
    session.status = session.doorOpened ? 'success' : 'ready'
  } else {
    session.status = 'running'
  }

  return { session, missingCount, missingItems, display }
}

// Legt die Standard-Checkliste an bzw. setzt sie wieder als aktive Checkliste.
async function ensureDefaultChecklist() {
  if (USE_MONGODB) {
    await Checklist.updateMany({}, { active: false })
    let checklist = await Checklist.findOne({ name: 'School' })

    if (!checklist) {
      checklist = await Checklist.create({ name: 'School', items: DEFAULT_ITEMS, active: true })
    } else {
      checklist.items = DEFAULT_ITEMS
      checklist.active = true
      await checklist.save()
    }

    return checklist
  }

  memory.checklist = {
    _id: memory.checklist?._id || makeMemoryId(),
    name: 'School',
    items: structuredClone(DEFAULT_ITEMS),
    active: true,
    createdAt: memory.checklist?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return memory.checklist
}

async function getActiveChecklistData() {
  if (USE_MONGODB) return Checklist.findOne({ active: true })
  return memory.checklist
}

async function getCurrentSessionData() {
  if (USE_MONGODB) return Session.findOne().sort({ createdAt: -1 })
  return memory.currentSession
}

export async function createDefaultChecklist(req, res, next) {
  try {
    const checklist = await ensureDefaultChecklist()
    res.status(201).json({ error: 0, data: toPlain(checklist) })
  } catch (error) {
    next(error)
  }
}

export async function getActiveChecklist(req, res, next) {
  try {
    const checklist = await getActiveChecklistData()
    if (!checklist) return res.status(404).json({ error: 1, data: 'No active checklist' })
    res.json({ error: 0, data: toPlain(checklist) })
  } catch (error) {
    next(error)
  }
}

export async function startSession(req, res, next) {
  try {
    let checklist = await getActiveChecklistData()
    if (!checklist) checklist = await ensureDefaultChecklist()
    const c = toPlain(checklist)

    // Beim Start werden alle Einträge der Checkliste in eine neue Session kopiert.
    let session
    if (USE_MONGODB) {
      session = await Session.create({
        checklistId: c._id,
        checklistName: c.name,
        items: c.items.map((item) => ({ ...item, checked: false })),
      })
    } else {
      session = {
        _id: makeMemoryId(),
        checklistId: c._id,
        checklistName: c.name,
        items: c.items.map((item) => ({ ...item, checked: false })),
        doorOpened: false,
        status: 'running',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      memory.currentSession = session
      memory.history.unshift(structuredClone(session))
    }

    res.status(201).json({ error: 0, data: summarize(session) })
  } catch (error) {
    next(error)
  }
}

export async function getCurrentSession(req, res, next) {
  try {
    const session = await getCurrentSessionData()
    if (!session) return res.status(404).json({ error: 1, data: 'No current session' })
    res.json({ error: 0, data: summarize(session) })
  } catch (error) {
    next(error)
  }
}

export async function checkNext(req, res, next) {
  try {
    const session = await getCurrentSessionData()
    if (!session) return res.status(404).json({ error: 1, data: 'No current session' })

    // Für den Prototyp wird immer der nächste noch offene Eintrag bestätigt.
    const item = session.items.find((entry) => !entry.checked)
    if (item) item.checked = true

    if (USE_MONGODB) await session.save()
    else session.updatedAt = new Date().toISOString()

    res.json({ error: 0, data: summarize(session) })
  } catch (error) {
    next(error)
  }
}

export async function doorOpened(req, res, next) {
  try {
    const session = await getCurrentSessionData()
    if (!session) return res.status(404).json({ error: 1, data: 'No current session' })

    // Ein Türereignis löst einen Alarm aus, solange noch Gegenstände fehlen.
    session.doorOpened = true
    const summary = summarize(session)
    session.status = summary.session.status

    if (USE_MONGODB) await session.save()
    else session.updatedAt = new Date().toISOString()

    res.json({ error: 0, data: summarize(session) })
  } catch (error) {
    next(error)
  }
}

export async function getHistory(req, res, next) {
  try {
    let sessions
    if (USE_MONGODB) sessions = await Session.find().sort({ createdAt: -1 }).limit(30)
    else sessions = memory.history

    res.json({ error: 0, data: sessions.map((session) => summarize(session)) })
  } catch (error) {
    next(error)
  }
}
