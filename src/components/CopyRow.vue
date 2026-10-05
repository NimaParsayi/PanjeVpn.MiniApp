<script setup lang="ts">
import FIcon from './FIcon.vue'
import { copyText, haptic } from '@/telegram/webapp'
import { useUi } from '@/stores/ui'

const props = defineProps<{ label: string; value: string; display?: string; ltr?: boolean }>()
const ui = useUi()
async function copy() {
  haptic.tap()
  const ok = await copyText(props.value)
  ui.toast(ok ? 'کپی شد' : 'کپی انجام نشد', ok ? 'success' : 'error', 1600)
}
</script>

<template>
  <button type="button" class="row" @click="copy">
    <div class="tx">
      <small>{{ label }}</small>
      <span class="v" :class="{ ltr, mono: ltr }">{{ display ?? value }}</span>
    </div>
    <span class="ic"><FIcon name="copy" :size="18" /></span>
  </button>
</template>

<style scoped>
.row { display: flex; align-items: center; gap: var(--s-m); width: 100%; padding: var(--s-m); background: var(--bg-1); border: 1px solid var(--stroke-3); box-shadow: var(--shadow-2); border-radius: var(--r-xl); text-align: start; cursor: pointer; transition: background var(--dur-fast); }
.row:hover { background: var(--bg-subtle-hover); } .row:active { background: var(--bg-subtle-pressed); }
.tx { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
small { font: var(--t-caption); color: var(--fg-3); }
.v { font: var(--t-body-strong); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.v.mono { font-size: 13px; font-weight: 500; text-align: right; white-space: normal; word-break: break-all; line-height: 20px; }
.ic { color: var(--fg-brand); display: grid; place-items: center; width: 32px; height: 32px; border-radius: var(--r-md); background: var(--brand-bg-tint); }
</style>
