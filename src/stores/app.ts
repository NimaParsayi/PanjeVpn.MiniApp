import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, isDemo, type Me, type Plan, type UserService } from '@/api'
import { isTelegram } from '@/telegram/webapp'

export const useApp = defineStore('app', () => {
  const me = ref<Me | null>(null)
  const plans = ref<Plan[]>([])
  const services = ref<UserService[]>([])
  const servicesLoading = ref(false)
  const loaded = ref(false)
  const loadError = ref<string | null>(null)

  async function boot() {
    loadError.value = null
    if (!isDemo && !isTelegram) {
      loadError.value = 'این برنامه یه مینی‌اپ تلگرامه؛ لطفاً از داخل ربات «پنجه» بازش کن.'
      return
    }
    try {
      // Services need one panel lookup each, so they load in the background.
      const [m, p] = await Promise.all([api.getMe(), api.getPlans()])
      me.value = m
      plans.value = p
      loaded.value = true
      void refreshServices().catch(() => {})
    } catch (e) {
      loadError.value = (e as Error).message
    }
  }

  const refreshMe = async () => { me.value = await api.getMe() }
  async function refreshServices() {
    servicesLoading.value = true
    try { services.value = await api.getServices() } finally { servicesLoading.value = false }
  }
  const planById = (id: string) => plans.value.find((p) => p.id === id)

  return { me, plans, services, servicesLoading, loaded, loadError, boot, refreshMe, refreshServices, planById }
})
