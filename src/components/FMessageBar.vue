<script setup lang="ts">
import FIcon from './FIcon.vue'
const props = withDefaults(defineProps<{ intent?: 'info' | 'warning' | 'success' | 'error'; title?: string }>(), { intent: 'info' })
const icon = { info: 'info', warning: 'warning', success: 'checkCircle', error: 'error' }[props.intent]
</script>

<template>
  <div class="mb" :class="intent" role="alert">
    <FIcon :name="icon" :size="20" class="ic" />
    <div class="tx"><strong v-if="title">{{ title }}</strong><div><slot /></div></div>
    <slot name="action" />
  </div>
</template>

<style scoped>
.mb { display: flex; align-items: flex-start; gap: var(--s-m); padding: var(--s-m); border-radius: var(--r-xl); border: 0; font: var(--t-body); font-size: 13px; line-height: 20px; }
.tx { flex: 1; display: flex; flex-direction: column; }
strong { font-weight: 600; display: block; margin-bottom: 2px; }
.ic { margin-top: 1px; }
.info { background: var(--info-bg); } .info .ic { color: var(--fg-brand); }
.warning { background: var(--warning-bg); } .warning .ic { color: var(--warning-solid); }
.success { background: var(--success-bg); } .success .ic { color: var(--success-solid); }
.error { background: var(--danger-bg); } .error .ic { color: var(--danger-solid); }
</style>
