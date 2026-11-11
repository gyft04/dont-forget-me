import { Router } from 'express'
import {
  createDefaultChecklist,
  getActiveChecklist,
  startSession,
  getCurrentSession,
  checkNext,
  doorOpened,
  getHistory,
} from '../controllers/dontforget.controller.js'

const router = Router()

// Einfache Statusroute für einen schnellen Verbindungstest.
router.get('/status', (req, res) => res.json({ error: 0, data: 'OK' }))

// Checklisten-Verwaltung.
router.post('/checklists/default', createDefaultChecklist)
router.get('/checklists/active', getActiveChecklist)

// Ablauf einer aktuellen Checklisten-Session.
router.post('/sessions/start', startSession)
router.get('/sessions/current', getCurrentSession)
router.patch('/sessions/current/check-next', checkNext)
router.post('/sessions/current/door-opened', doorOpened)
router.get('/sessions/history', getHistory)

export default router
