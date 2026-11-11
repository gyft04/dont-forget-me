<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">SMART CHECKLIST</p>
      <h1>Ready to leave without forgetting anything?</h1>
      <p class="intro">
        Start your checklist, validate each object, and let the assistant warn you if the door opens too early.
      </p>
    </section>

    <section class="dashboard-grid">
      <div class="panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">CHECKLIST</p>
            <h2>{{ checklist?.name || 'School' }}</h2>
          </div>
          <span class="status-pill" :class="statusClass">{{ statusLabel }}</span>
        </div>

        <div class="items">
          <div v-for="item in visibleItems" :key="item.code" class="item" :class="{ checked: item.checked }">
            <div class="check-icon">{{ item.checked ? '✓' : '○' }}</div>
            <div class="item-copy">
              <strong>{{ item.label }}</strong>
              <span>{{ item.code }}</span>
            </div>
          </div>
        </div>

        <p v-if="message" class="message" :class="{ error: isError }">{{ message }}</p>
      </div>

      <aside class="panel device-panel">
        <p class="eyebrow">PHYSICAL DISPLAY</p>
        <div class="display" :class="displayClass">{{ displayText }}</div>
        <p class="device-help">
          Simulation of the TM1637 display. The ESP32 reads the same backend state through the REST API.
        </p>
        <div class="small-stats">
          <div><span>Missing</span><strong>{{ missingCount }}</strong></div>
          <div><span>Door</span><strong>{{ session?.doorOpened ? 'OPEN' : 'CLOSED' }}</strong></div>
        </div>
      </aside>
    </section>

    <section class="actions panel">
      <div class="action-head">
        <div>
          <p class="eyebrow">DEMO CONTROLS</p>
          <h2>Test without ESP32</h2>
        </div>
        <p>These buttons reproduce the main hardware interactions.</p>
      </div>

      <div class="buttons">
        <button class="secondary" @click="loadChecklist">Load checklist</button>
        <button class="secondary" @click="createDefault">Create default checklist</button>
        <button class="primary" @click="startSession">Start session</button>
        <button class="success" :disabled="!session || missingCount === 0" @click="checkNext">Check next item</button>
        <button class="danger" :disabled="!session" @click="openDoor">Simulate door opening</button>
      </div>
    </section>

    <section class="how panel">
      <p class="eyebrow">SYSTEM FLOW</p>
      <div class="flow">
        <span>0004</span><b>→</b><span>0003</span><b>→</b><span>0002</span><b>→</b><span>0001</span><b>→</b><span class="done">DONE</span>
      </div>
      <p>If the GPIO27 door switch is triggered before the checklist is complete, the backend returns <strong>MISS</strong>, shown as <strong>FAIL</strong> on the hardware display.</p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getRequest, patchRequest, postRequest } from '../services/axios.service.js'

// Reaktive Zustände für Checkliste, aktuelle Session und Rückmeldungen an die Oberfläche.
const checklist = ref(null)
const summary = ref(null)
const message = ref('')
const isError = ref(false)

// Aus der Backend-Antwort werden die Werte abgeleitet, die direkt in der UI angezeigt werden.
const session = computed(() => summary.value?.session || null)
const missingCount = computed(
  () => summary.value?.missingCount ?? session.value?.items?.filter((item) => !item.checked).length ?? 4,
)
const displayText = computed(() => summary.value?.display || String(missingCount.value).padStart(4, '0'))
const visibleItems = computed(
  () =>
    session.value?.items ||
    checklist.value?.items?.map((item) => ({ ...item, checked: false })) || [
      { label: 'Keys', code: 'KEYS', checked: false },
      { label: 'Student card', code: 'CARD', checked: false },
      { label: 'Laptop', code: 'LAPT', checked: false },
      { label: 'Charger', code: 'CHAR', checked: false },
    ],
)
const statusLabel = computed(() => session.value?.status?.toUpperCase() || 'IDLE')
const statusClass = computed(() => ({
  alert: session.value?.status === 'alert',
  success: ['ready', 'success'].includes(session.value?.status),
}))
const displayClass = computed(() => ({
  danger: displayText.value === 'MISS',
  success: displayText.value === 'DONE',
}))

// Verarbeitet das gemeinsame Antwortformat der API und setzt eine Meldung für die Benutzeroberfläche.
function handle(response, successText) {
  if (!response || response.error) {
    isError.value = true
    message.value = response?.data || 'Something went wrong'
    return null
  }

  isError.value = false
  message.value = successText
  return response.data
}

async function loadChecklist() {
  const data = handle(await getRequest('/checklists/active'), 'Checklist loaded.')
  if (data) checklist.value = data
}

async function createDefault() {
  const data = handle(await postRequest('/checklists/default'), 'Default checklist created.')
  if (data) checklist.value = data
}

async function startSession() {
  const data = handle(await postRequest('/sessions/start'), 'Session started. You can now validate the objects.')
  if (data) summary.value = data
}

async function checkNext() {
  const data = handle(await patchRequest('/sessions/current/check-next'), 'Next object validated.')
  if (data) summary.value = data
}

async function openDoor() {
  const data = handle(await postRequest('/sessions/current/door-opened'), 'Door event sent to the backend.')
  if (data) summary.value = data
}

// Beim Laden der Seite werden vorhandene Daten übernommen, falls bereits eine Session läuft.
onMounted(async () => {
  const active = await getRequest('/checklists/active')
  if (!active.error) checklist.value = active.data

  const current = await getRequest('/sessions/current')
  if (!current.error) summary.value = current.data
})
</script>

<style scoped>
.page { width: min(1100px, calc(100% - 32px)); margin: 0 auto; padding: 46px 0 60px; }
.hero { max-width: 760px; margin-bottom: 28px; }
.eyebrow { margin: 0 0 7px; font-size: .72rem; letter-spacing: .13em; font-weight: 800; color: #2563eb; }
h1 { margin: 0; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1.04; letter-spacing: -.035em; }
h2 { margin: 0; font-size: 1.25rem; }
.intro { max-width: 680px; color: #64748b; line-height: 1.65; }
.dashboard-grid { display: grid; grid-template-columns: 1.5fr .8fr; gap: 18px; }
.panel { background: white; border: 1px solid #e5eaf3; border-radius: 20px; padding: 24px; box-shadow: 0 8px 30px rgba(20, 40, 80, .06); }
.panel-heading, .action-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
.status-pill { padding: 7px 10px; border-radius: 999px; background: #e2e8f0; color: #475569; font-size: .72rem; font-weight: 800; }
.status-pill.alert { background: #fee2e2; color: #b91c1c; }
.status-pill.success { background: #dcfce7; color: #15803d; }
.items { display: grid; gap: 11px; margin-top: 22px; }
.item { display: flex; align-items: center; gap: 13px; padding: 15px; border: 1px solid #e5eaf3; border-radius: 14px; transition: .2s ease; }
.item.checked { border-color: #bbf7d0; background: #f0fdf4; }
.check-icon { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; background: #eef2ff; color: #2563eb; font-size: 1.25rem; font-weight: 900; }
.checked .check-icon { background: #22c55e; color: white; }
.item-copy { display: flex; justify-content: space-between; align-items: center; flex: 1; gap: 14px; }
.item-copy span { font: 700 .72rem ui-monospace, SFMono-Regular, Menlo, monospace; color: #94a3b8; }
.device-panel { display: flex; flex-direction: column; }
.display { margin: 20px 0 12px; padding: 22px 14px; border-radius: 14px; text-align: center; background: #111827; color: #60a5fa; font: 800 clamp(2.6rem, 7vw, 4.6rem) ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; text-shadow: 0 0 15px rgba(96,165,250,.65); }
.display.success { color: #4ade80; text-shadow: 0 0 15px rgba(74,222,128,.6); }
.display.danger { color: #f87171; text-shadow: 0 0 15px rgba(248,113,113,.6); }
.device-help, .action-head p, .how p { color: #64748b; line-height: 1.55; }
.small-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: auto; }
.small-stats div { padding: 14px; background: #f8fafc; border-radius: 12px; }
.small-stats span { display: block; font-size: .73rem; color: #94a3b8; }
.small-stats strong { display: block; margin-top: 4px; }
.actions, .how { margin-top: 18px; }
.buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
button { border: 0; border-radius: 11px; padding: 11px 15px; font-weight: 750; cursor: pointer; transition: transform .12s ease, opacity .12s ease; }
button:hover:not(:disabled) { transform: translateY(-1px); }
button:disabled { opacity: .45; cursor: not-allowed; }
.primary { background: #2563eb; color: white; }
.secondary { background: #e8eefc; color: #1d4ed8; }
.success { background: #22c55e; color: #052e16; }
.danger { background: #dc2626; color: white; }
.message { margin: 18px 0 0; padding: 10px 12px; border-radius: 10px; background: #eff6ff; color: #1d4ed8; }
.message.error { background: #fef2f2; color: #b91c1c; }
.flow { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
.flow span { padding: 8px 11px; border-radius: 8px; background: #111827; color: #60a5fa; font: 800 .86rem ui-monospace, monospace; }
.flow .done { color: #4ade80; }
.flow b { color: #94a3b8; }
@media (max-width: 760px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .panel-heading, .action-head { flex-direction: column; }
  .page { width: min(100% - 22px, 1100px); padding-top: 30px; }
}
</style>
