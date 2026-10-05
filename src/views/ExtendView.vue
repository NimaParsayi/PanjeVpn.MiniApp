<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FButton from '@/components/FButton.vue'
import FSheet from '@/components/FSheet.vue'
import FMessageBar from '@/components/FMessageBar.vue'
import FSkeleton from '@/components/FSkeleton.vue'
import OrderPicker from '@/components/OrderPicker.vue'
import { api, ApiError, type UserService } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { fa, faDecimal, gb, toman } from '@/utils/format'
import { pricePerGb, totalPrice } from '@/utils/pricing'

const route = useRoute()
const router = useRouter()
const app = useApp()
const ui = useUi()

const service = ref<UserService | null>(null)
const plan = computed(() => (service.value ? app.planById(service.value.planId) : undefined))
const size = ref(0)
const daysIndex = ref(0)
const confirming = ref(false)
const busy = ref(false)

onMounted(async () => {
  try {
    service.value = await api.getService(String(route.params.id))
    size.value = plan.value?.minSize ?? 0
    if (!plan.value || service.value.totalGb === 0) router.replace(`/services/${service.value.id}`)
  } catch (e) {
    ui.toast((e as Error).message, 'error')
    router.replace('/services')
  }
})

const price = computed(() => (plan.value ? totalPrice(plan.value, size.value, daysIndex.value) : 0))
const balance = computed(() => app.me?.wallet ?? 0)
const enough = computed(() => balance.value >= price.value)

async function extend() {
  if (!service.value) return
  busy.value = true
  try {
    await api.extendService({ serviceId: service.value.id, size: size.value, daysIndex: daysIndex.value })
    await Promise.all([app.refreshMe(), app.refreshServices()])
    confirming.value = false
    ui.toast('سرویس با موفقیت تمدید شد', 'success')
    router.replace(`/services/${service.value.id}`)
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="view">
    <PageHeader title="تمدید سرویس" back />
    <main v-if="service && plan" class="page no-nav">
      <FCard padding="md">
        <div class="kv"><span>شناسه کانفیگ</span><b class="ltr mono id">{{ service.name }}</b></div>
        <div class="kv"><span>حجم فعلی</span><b class="num">{{ faDecimal(service.totalGb) }} گیگابایت</b></div>
      </FCard>

      <OrderPicker v-model:size="size" v-model:days-index="daysIndex" :plan="plan" />

      <FMessageBar intent="warning">
        با تمدید، زمان سرویس از <b>همین الان</b> محاسبه می‌شه و به زمان قبلی اضافه نمی‌شه، ولی حجم تمدید به حجم قبلی <b>اضافه</b> می‌شه.
      </FMessageBar>

      <FCard padding="lg">
        <div class="kv"><span>حجم جدید</span><b class="num">{{ gb(service.totalGb + size) }}</b></div>
        <div class="kv"><span>زمان</span><b class="num">{{ fa(plan.days[daysIndex]) }} روز از امروز</b></div>
        <div class="kv"><span>قیمت هر گیگابایت</span><b class="num">{{ toman(pricePerGb(plan, daysIndex)) }}</b></div>
        <div class="divider" />
        <div class="kv total"><span>مجموع مبلغ</span><b class="num">{{ toman(price) }}</b></div>
        <div class="kv"><span>موجودی کیف پول</span><b class="num" :class="{ bad: !enough }">{{ toman(balance) }}</b></div>
      </FCard>

      <FMessageBar v-if="!enough" intent="error" title="موجودی کافی نیست">
        <template #action><FButton size="sm" appearance="primary" @click="$router.push('/wallet/deposit/ton')">شارژ</FButton></template>
        {{ toman(price - balance) }} دیگه لازم داری.
      </FMessageBar>

      <div class="sticky-cta">
        <FButton appearance="success" size="lg" block icon="check" :disabled="!enough" @click="confirming = true">تایید و تمدید</FButton>
      </div>
    </main>
    <main v-else class="page no-nav"><FSkeleton :h="90" :r="8" /><FSkeleton :h="200" :r="8" /></main>

    <FSheet :open="confirming" title="تایید تمدید" @close="!busy && (confirming = false)">
      <div class="kv"><span>سرویس</span><b class="ltr mono id">{{ service?.name }}</b></div>
      <div class="kv"><span>حجم افزوده</span><b class="num">{{ gb(size) }}</b></div>
      <div class="kv"><span>زمان</span><b class="num">{{ fa(plan?.days[daysIndex] ?? 0) }} روز</b></div>
      <div class="kv total"><span>از کیف پول کسر می‌شه</span><b class="num">{{ toman(price) }}</b></div>
      <template #footer><FButton appearance="success" size="lg" block :loading="busy" @click="extend">پرداخت و تمدید</FButton></template>
    </FSheet>
  </div>
</template>

<style scoped>
.id { font-size: 12px; font-weight: 500; }
.total span, .total b { font: var(--t-subtitle2); color: var(--fg-1); }
.total b { color: var(--fg-brand); }
.bad { color: var(--danger-fg); }
</style>
