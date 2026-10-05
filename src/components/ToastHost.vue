<script setup lang="ts">
import FIcon from './FIcon.vue'
import { useUi } from '@/stores/ui'
const ui = useUi()
const icons = { success: 'checkCircle', error: 'error', warning: 'warning', info: 'info' } as const
</script>

<template>
  <div class="host" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.intent">
        <FIcon :name="icons[t.intent]" :size="20" />
        <span>{{ t.text }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.host {
  position: fixed; z-index: 100; inset-inline: var(--s-l); bottom: calc(var(--safe-bottom) + 96px);
  display: flex; flex-direction: column; gap: var(--s-s); align-items: center; pointer-events: none;
}
.toast {
  display: flex; align-items: center; gap: var(--s-m); max-width: 460px; width: 100%;
  padding: var(--s-m) var(--s-l); border-radius: var(--r-xl);
  background: var(--bg-1); color: var(--fg-1); border: 1px solid var(--stroke-3); box-shadow: var(--shadow-16);
  font: var(--t-body);
}
.success svg { color: var(--success-solid); } .error svg { color: var(--danger-solid); }
.warning svg { color: var(--warning-solid); } .info svg { color: var(--fg-brand); }
.toast-enter-active { transition: all var(--dur-slow) var(--ease-decel); }
.toast-leave-active { transition: all var(--dur-fast) var(--ease-accel); }
.toast-enter-from { opacity: 0; transform: translateY(16px) scale(0.98); }
.toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
