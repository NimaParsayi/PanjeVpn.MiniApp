<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from 'telegram-ui-vue'
import FIcon from './FIcon.vue'
import { api, ApiError } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { confetti } from '@/utils/confetti'
import { haptic } from '@/telegram/webapp'
import { toman } from '@/utils/format'

/**
 * A card-to-card payment the user started but that isn't settled yet. It is shown on every screen so they can
 * confirm it with one tap instead of hunting for the payment page.
 */
const app = useApp()
const ui = useUi()
const route = useRoute()
const router = useRouter()
const busy = ref(false)

const pending = computed(() => app.me?.pendingDeposit ?? null)
// The deposit screen has its own, richer controls for the same payment.
const visible = computed(() => !!pending.value && !route.path.startsWith('/wallet/deposit'))

async function check() {
  if (!pending.value) return
  busy.value = true
  try {
    const r = await api.checkDeposit(pending.value.transactionId)
    await app.refreshMe()
    if (r.paid) { haptic.success(); confetti(); ui.toast('پرداخت تأیید شد و کیف پولت شارژ شد 🎉', 'success', 3500) }
    else ui.toast(r.note ?? 'هنوز پرداختت ثبت نشده!', r.status === 'failed' ? 'error' : 'warning', 3500)
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { busy.value = false }
}
</script>

<template>
  <div v-if="visible && pending" class="pending">
    <span class="ic"><FIcon name="clock" :size="20" /></span>
    <div class="txt">
      <b>پرداخت کارت‌به‌کارت در انتظاره</b>
      <small class="num">{{ toman(pending.priceToman) }}</small>
    </div>
    <Button size="s" :loading="busy" @click="check">پرداخت کردم</Button>
    <button class="open" type="button" aria-label="جزئیات" @click="router.push('/wallet/history')"><FIcon name="chevronEnd" :size="16" /></button>
  </div>
</template>

<style scoped>
.pending {
  display: flex; align-items: center; gap: 10px; margin: 8px 16px 0; padding: 10px 12px; border-radius: 16px;
  background: var(--glass-bg); box-shadow: var(--glass-hl), 0 0 0 1px var(--glass-edge) inset;
}
.ic { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; color: var(--tgui-link-color); background: color-mix(in srgb, var(--tgui-link-color) 14%, transparent); flex: none; }
.txt { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; font-size: 13.5px; }
.txt small { color: var(--tgui-hint-color); font-size: 12px; }
.open { all: unset; cursor: pointer; color: var(--tgui-hint-color); display: grid; place-items: center; padding: 4px; }
</style>
