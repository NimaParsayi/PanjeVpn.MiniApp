<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FField from '@/components/FField.vue'
import FButton from '@/components/FButton.vue'
import FSheet from '@/components/FSheet.vue'
import FMessageBar from '@/components/FMessageBar.vue'
import OrderPicker from '@/components/OrderPicker.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { api, ApiError } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { confetti } from '@/utils/confetti'
import { fa, gb, toman } from '@/utils/format'
import { isUnlimited, pricePerGb, totalPrice } from '@/utils/pricing'

const route = useRoute()
const router = useRouter()
const app = useApp()
const ui = useUi()

const plan = computed(() => app.planById(String(route.params.planId)))
if (!plan.value) router.replace('/buy')

const randomName = () => Array.from({ length: 5 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 31)]).join('')
const name = ref(randomName())
const size = ref(plan.value?.minSize ?? 0)
const daysIndex = ref(0)
const confirming = ref(false)
const busy = ref(false)

const nameError = computed(() => (/^[A-Za-z0-9_]{3,24}$/.test(name.value) ? '' : 'نام باید ۳ تا ۲۴ کاراکتر و فقط شامل حروف انگلیسی، عدد و _ باشد'))
const price = computed(() => (plan.value ? totalPrice(plan.value, size.value, daysIndex.value) : 0))
const balance = computed(() => app.me?.wallet ?? 0)
const enough = computed(() => balance.value >= price.value)
const prefix = computed(() => (app.me?.isReseller ? app.me.resellerTitle : app.me?.telegramId))

function review() {
  if (nameError.value) return ui.toast(nameError.value, 'error')
  confirming.value = true
}

async function buy() {
  if (!plan.value) return
  busy.value = true
  try {
    const s = await api.createService({ planId: plan.value.id, size: size.value, daysIndex: daysIndex.value, name: name.value })
    await Promise.all([app.refreshMe(), app.refreshServices()])
    confirming.value = false
    confetti()
    router.replace({ path: `/services/${s.id}`, query: { created: '1' } })
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div v-if="plan" class="view">
    <PageHeader :title="plan.name" subtitle="سفارش سرویس جدید" back="/buy" />
    <main class="page">
      <FCard padding="lg">
        <FField v-model="name" label="نام کانفیگ" ltr :error="nameError && name ? nameError : ''" hint="برای تشخیص راحت‌تر بین سرویس‌هات؛ فقط حروف انگلیسی و عدد" :maxlength="24" />
        <p class="muted pre num">شناسه نهایی: <span class="ltr mono">{{ prefix }}-{{ name || '…' }}</span></p>
      </FCard>

      <OrderPicker v-model:size="size" v-model:days-index="daysIndex" :plan="plan" />

      <FCard padding="lg">
        <div class="kv"><span>سرویس</span><b>{{ plan.name }}</b></div>
        <div class="kv"><span>حجم</span><b class="num">{{ isUnlimited(plan) ? 'نامحدود' : gb(size) }}</b></div>
        <div class="kv"><span>زمان</span><b class="num">{{ fa(plan.days[daysIndex]) }} روز</b></div>
        <div v-if="!isUnlimited(plan)" class="kv"><span>قیمت هر گیگابایت</span><b class="num">{{ toman(pricePerGb(plan, daysIndex)) }}</b></div>
        <div class="divider" />
        <div class="kv total"><span>مجموع مبلغ</span><b class="num">{{ toman(price) }}</b></div>
        <div class="kv"><span>موجودی کیف پول</span><b class="num" :class="{ bad: !enough }">{{ toman(balance) }}</b></div>
      </FCard>

      <FMessageBar v-if="!enough" intent="warning" title="موجودی کافی نیست">
        برای این سفارش {{ toman(price - balance) }} دیگه لازم داری.
        <template #action><FButton size="sm" appearance="primary" @click="$router.push('/wallet/deposit/ton')">شارژ</FButton></template>
      </FMessageBar>

      <div class="sticky-cta">
        <FButton appearance="primary" size="lg" block icon="check" :disabled="!enough || !!nameError" @click="review">تایید و خرید</FButton>
      </div>
    </main>

    <FSheet :open="confirming" title="تایید خرید" @close="!busy && (confirming = false)">
      <div class="row sum">
        <ToneIcon :icon="plan.icon" :tone="plan.tone" />
        <div class="grow"><b>{{ plan.name }}</b><div class="muted ltr mono nm">{{ prefix }}-{{ name }}</div></div>
      </div>
      <div class="kv"><span>حجم</span><b class="num">{{ isUnlimited(plan) ? 'نامحدود' : gb(size) }}</b></div>
      <div class="kv"><span>زمان</span><b class="num">{{ fa(plan.days[daysIndex]) }} روز</b></div>
      <div class="kv total"><span>از کیف پول کسر می‌شه</span><b class="num">{{ toman(price) }}</b></div>
      <template #footer>
        <FButton appearance="primary" size="lg" block :loading="busy" @click="buy">پرداخت و ساخت سرویس</FButton>
      </template>
    </FSheet>
  </div>
</template>

<style scoped>
.pre { font: var(--t-caption); margin-top: var(--s-s); display: flex; gap: var(--s-xs); flex-wrap: wrap; }
.total span, .total b { font: var(--t-subtitle2); color: var(--fg-1); }
.total b { color: var(--fg-brand); }
.bad { color: var(--danger-fg); }
.sum { padding-bottom: var(--s-s); }
.nm { font-size: 12px; }
</style>
