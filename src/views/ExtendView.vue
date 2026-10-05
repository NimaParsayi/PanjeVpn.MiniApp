<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Banner, Button, Cell, List, Modal, ModalHeader, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import OrderPicker from '@/components/OrderPicker.vue'
import FIcon from '@/components/FIcon.vue'
import { api, ApiError, type UserService } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { confetti } from '@/utils/confetti'
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
    confetti()
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
  <div class="screen">
    <PageTitle title="تمدید سرویس" back />
    <List v-if="service && plan">
      <Section>
        <Cell><template #after><span class="ltr id">{{ service.name }}</span></template>شناسه کانفیگ</Cell>
        <Cell><template #after><span class="num">{{ faDecimal(service.totalGb) }} گیگابایت</span></template>حجم فعلی</Cell>
      </Section>

      <OrderPicker v-model:size="size" v-model:days-index="daysIndex" :plan="plan" />

      <Banner type="section">
        <template #before><TgEmoji :id="E.warning" fallback="warning" :size="32" /></template>
        <template #header>زمان از همین الان محاسبه می‌شه</template>
        <template #subheader>با تمدید، زمان سرویس به زمان قبلی اضافه نمی‌شه، ولی حجم تمدید به حجم قبلی اضافه می‌شه.</template>
      </Banner>

      <Section>
        <template #header>خلاصه تمدید</template>
        <Cell><template #after><span class="num">{{ gb(service.totalGb + size) }}</span></template>حجم جدید</Cell>
        <Cell><template #after><span class="num">{{ fa(plan.days[daysIndex]) }} روز از امروز</span></template>زمان</Cell>
        <Cell><template #after><span class="num">{{ toman(pricePerGb(plan, daysIndex)) }}</span></template>قیمت هر گیگابایت</Cell>
        <Cell><template #after><b class="num total">{{ toman(price) }}</b></template><b>مجموع مبلغ</b></Cell>
        <Cell><template #after><span class="num" :class="{ bad: !enough }">{{ toman(balance) }}</span></template>موجودی کیف پول</Cell>
      </Section>

      <Banner v-if="!enough" type="section">
        <template #before><TgEmoji :id="E.warning" fallback="error" :size="32" /></template>
        <template #header>موجودی کافی نیست</template>
        <template #subheader>{{ toman(price - balance) }} دیگه لازم داری.</template>
        <Button size="s" @click="router.push('/wallet/deposit/ton')">شارژ کیف پول</Button>
      </Banner>
    </List>
    <List v-else><Section><Skeleton visible><div style="height: 200px" /></Skeleton></Section></List>

    <div v-if="service && plan" class="action-bar">
      <Button stretched size="l" :disabled="!enough" @click="confirming = true">تایید و تمدید · {{ toman(price) }}</Button>
    </div>

    <Modal v-model:open="confirming">
      <template #header><ModalHeader>تایید تمدید</ModalHeader></template>
      <div class="sheet">
        <Cell><template #after><span class="ltr id">{{ service?.name }}</span></template>سرویس</Cell>
        <Cell><template #after><span class="num">{{ gb(size) }}</span></template>حجم افزوده</Cell>
        <Cell><template #after><span class="num">{{ fa(plan?.days[daysIndex] ?? 0) }} روز</span></template>زمان</Cell>
        <Cell><template #after><b class="num total">{{ toman(price) }}</b></template>از کیف پول کسر می‌شه</Cell>
        <div class="pad cta"><Button stretched size="l" :loading="busy" @click="extend">پرداخت و تمدید</Button></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.id { font-size: 12px; }
.total { color: var(--tgui-link-color); }
.bad { color: var(--tgui-destructive-text-color); }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.cta { margin-top: 12px; }
</style>
