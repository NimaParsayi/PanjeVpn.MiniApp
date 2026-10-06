<script setup lang="ts">
import { Cell } from 'telegram-ui-vue'
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
  <Cell multiline @click="copy">
    <template #subhead>{{ props.label }}</template>
    <span class="v" :class="{ ltr, mono: ltr }">{{ display ?? value }}</span>
    <template #after><FIcon name="copy" :size="20" class="ic" /></template>
  </Cell>
</template>

<style scoped>
.v { word-break: break-all; }
.v.mono { font-size: 12px; }
.ic { color: var(--tgui-link-color); }
</style>
