import { defineStore } from 'pinia'
import { ref } from 'vue'
import { haptic } from '@/telegram/webapp'

export type Intent = 'success' | 'error' | 'info' | 'warning'
export interface ToastItem { id: number; text: string; intent: Intent; ms: number }

export const useUi = defineStore('ui', () => {
  const toasts = ref<ToastItem[]>([])
  let n = 0

  function toast(text: string, intent: Intent = 'info', ms = 2600) {
    const id = ++n
    toasts.value = [...toasts.value.slice(-1), { id, text, intent, ms }]
    if (intent === 'success') haptic.success()
    else if (intent === 'error') haptic.error()
    else if (intent === 'warning') haptic.warning()
  }

  const dismiss = (id: number) => (toasts.value = toasts.value.filter((t) => t.id !== id))

  return { toasts, toast, dismiss }
})
