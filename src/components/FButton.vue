<script setup lang="ts">
import FIcon from './FIcon.vue'
import { haptic } from '@/telegram/webapp'

withDefaults(defineProps<{
  appearance?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconEnd?: string
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>(), { appearance: 'secondary', size: 'md' })

const emit = defineEmits<{ click: [e: MouseEvent] }>()
function onClick(e: MouseEvent) {
  haptic.tap()
  emit('click', e)
}
</script>

<template>
  <button
    class="fbtn" :class="[appearance, size, { block, loading }]" :disabled="disabled || loading" type="button"
    @click="onClick"
  >
    <span v-if="loading" class="spin" aria-hidden="true" />
    <FIcon v-else-if="icon" :name="icon" :size="size === 'sm' ? 16 : 20" />
    <span class="label"><slot /></span>
    <FIcon v-if="iconEnd && !loading" :name="iconEnd" :size="size === 'sm' ? 16 : 20" />
  </button>
</template>

<style scoped>
.fbtn {
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: var(--s-s);
  min-height: 46px; padding: 0 var(--s-xl);
  border: 0; border-radius: var(--r-lg);
  background: var(--bg-4); color: var(--fg-1);
  font: var(--t-body-strong); cursor: pointer; white-space: nowrap;
  transition: background var(--dur-fast) var(--ease-point), transform var(--dur-fast) var(--ease-spring),
    box-shadow var(--dur-normal) var(--ease-point), filter var(--dur-fast);
}
.fbtn.sm { min-height: 34px; padding: 0 var(--s-m); font: var(--t-caption); font-weight: 600; border-radius: var(--r-md); }
.fbtn.lg { min-height: 54px; padding: 0 var(--s-xxl); font: var(--t-subtitle2); border-radius: var(--r-xl); }
.fbtn.block { width: 100%; }
.fbtn:hover:not(:disabled) { background: var(--bg-5); }
.fbtn:active:not(:disabled) { transform: scale(0.97); }

.primary {
  background: linear-gradient(135deg, var(--brand-bg), color-mix(in oklab, var(--brand-bg) 78%, var(--brand-2)));
  color: var(--fg-on-brand); box-shadow: var(--glow);
}
.primary:hover:not(:disabled) { background: linear-gradient(135deg, var(--brand-bg-hover), var(--brand-bg)); filter: saturate(1.1); }

.success {
  background: linear-gradient(135deg, #34c25e, #1fa14a); color: #fff;
  box-shadow: 0 10px 26px color-mix(in srgb, #2fb457 38%, transparent);
}
.success:hover:not(:disabled) { background: linear-gradient(135deg, #2fb457, #198f41); }

.danger { background: var(--danger-bg); color: var(--danger-fg); }
.danger:hover:not(:disabled) { background: color-mix(in srgb, var(--p-destructive) 20%, var(--p-section)); }

.outline { background: transparent; box-shadow: inset 0 0 0 1.5px var(--stroke-1); }
.subtle { background: transparent; color: var(--fg-2); }
.subtle:hover:not(:disabled) { background: var(--bg-subtle-hover); color: var(--fg-1); }

.fbtn:disabled { cursor: not-allowed; background: var(--bg-4); color: var(--fg-disabled); box-shadow: none; }
.loading { cursor: progress; }

.spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid currentColor; border-inline-end-color: transparent; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
