<script setup lang="ts">
import { Snackbar } from 'telegram-ui-vue'
import FIcon from './FIcon.vue'
import { useUi } from '@/stores/ui'

const ui = useUi()
const icons = { success: 'checkCircle', error: 'error', warning: 'warning', info: 'info' } as const
</script>

<template>
  <Snackbar v-for="t in ui.toasts" :key="t.id" :duration="t.ms" @close="ui.dismiss(t.id)">
    <template #before><FIcon :name="icons[t.intent]" :size="20" /></template>
    {{ t.text }}
  </Snackbar>
</template>
