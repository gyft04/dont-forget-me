<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-mark">✓</div>
      <div>
        <strong>Don't Forget Me</strong>
        <span>Smart anti-forget assistant</span>
      </div>
    </header>
    <router-view />
  </div>
</template>

<style>
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #172033;
  background: #f3f6fb;
  font-synthesis: none;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; min-height: 100vh; }
button { font: inherit; }
.app-shell { min-height: 100vh; }
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 28px;
  color: white;
  background: #2563eb;
  box-shadow: 0 3px 16px rgba(37, 99, 235, .22);
}
.topbar strong { display: block; font-size: 1.08rem; }
.topbar span { display: block; opacity: .86; font-size: .86rem; margin-top: 2px; }
.brand-mark {
  width: 40px; height: 40px; display: grid; place-items: center;
  border-radius: 12px; background: rgba(255,255,255,.18); font-size: 1.3rem; font-weight: 800;
}
</style>
