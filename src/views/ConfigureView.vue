<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Banner, Button, Cell, Input, List, Modal, ModalHeader, Section } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import OrderPicker from '@/components/OrderPicker.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import FIcon from '@/components/FIcon.vue'
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
const trialConfirm = ref(false)
const trial = computed(() => plan.value?.trial ?? null)

const nameError = computed(() => (/^[A-Za-z0-9_]{3,24}$/.test(name.value) ? '' : 'نام باید ۳ تا ۲۴ کاراکتر و فقط شامل حروف انگلیسی، عدد و _ باشد'))
const price = computed(() => (plan.value ? totalPrice(plan.value, size.value, daysIndex.value) : 0))
const balance = computed(() => app.me?.wallet ?? 0)
const enough = computed(() => balance.value >= price.value)
const prefix = computed(() => (app.me?.isReseller ? app.me.resellerTitle : app.me?.telegramId))

async function takeTrial() {
  if (!plan.value) return
  busy.value = true
  try {
    const s = await api.claimTrial(plan.value.id)
    await Promise.all([app.refreshServices(), app.refreshPlans()])
    trialConfirm.value = false
    confetti()
    router.replace({ path: `/services/${s.id}`, query: { created: '1', trial: '1' } })
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
    await app.refreshPlans().catch(() => {})
    trialConfirm.value = false
  } finally {
    busy.value = false
  }
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
  <div v-if="plan" class="screen">
    <PageTitle :title="plan.name" subtitle="سفارش سرویس جدید" back />
    <List>
      <Banner v-if="trial?.status === 'available'" type="section">
        <template #before><TgEmoji :id="E.gift" fallback="gift" :size="36" /></template>
        <template #header>سرویس تست رایگان</template>
        <template #subheader>{{ fa(trial.gb) }} گیگابایت برای {{ fa(trial.days) }} روز، فقط یک‌بار برای این پلن. چیزی از کیف پولت کم نمی‌شه.</template>
        <Button size="s" @click="trialConfirm = true">دریافت تست رایگان</Button>
      </Banner>
      <p v-else-if="trial?.status === 'claimed'" class="trial-note">تست رایگان این پلن رو قبلاً گرفتی.</p>

      <Section>
        <template #header>نام کانفیگ</template>
        <Input :value="name" class="ltr" placeholder="مثلاً phone" :maxlength="24" :status="nameError ? 'error' : 'default'" @input="name = ($event.target as HTMLInputElement).value" />
        <template #footer>
          <span v-if="nameError" class="err">{{ nameError }}</span>
          <span v-else>شناسه نهایی: <span class="ltr">{{ prefix }}-{{ name }}</span></span>
        </template>
      </Section>

      <OrderPicker v-model:size="size" v-model:days-index="daysIndex" :plan="plan" />

      <Section>
        <template #header>خلاصه سفارش</template>
        <Cell><template #after>{{ plan.name }}</template>سرویس</Cell>
        <Cell><template #after><span class="num">{{ isUnlimited(plan) ? 'نامحدود' : gb(size) }}</span></template>حجم</Cell>
        <Cell><template #after><span class="num">{{ fa(plan.days[daysIndex]) }} روز</span></template>زمان</Cell>
        <Cell v-if="!isUnlimited(plan)"><template #after><span class="num">{{ toman(pricePerGb(plan, daysIndex)) }}</span></template>قیمت هر گیگابایت</Cell>
        <Cell><template #after><b class="num total">{{ toman(price) }}</b></template><b>مجموع مبلغ</b></Cell>
        <Cell><template #after><span class="num" :class="{ err: !enough }">{{ toman(balance) }}</span></template>موجودی کیف پول</Cell>
      </Section>

      <Banner v-if="!enough" type="section">
        <template #before><TgEmoji :id="E.warning" fallback="warning" :size="32" /></template>
        <template #header>موجودی کافی نیست</template>
        <template #subheader>برای این سفارش {{ toman(price - balance) }} دیگه لازم داری.</template>
        <Button size="s" @click="router.push('/wallet/deposit/ton')">شارژ کیف پول</Button>
      </Banner>
    </List>

    <div class="action-bar">
      <Button stretched size="l" :disabled="!enough || !!nameError" @click="confirming = true">تایید و خرید · {{ toman(price) }}</Button>
    </div>

    <Modal v-model:open="trialConfirm">
      <template #header><ModalHeader>دریافت سرویس تست</ModalHeader></template>
      <div v-if="trial" class="sheet">
        <Cell><template #before><ToneIcon :icon="plan.icon" :tone="plan.tone" :size="44" :emoji="plan.emojiId" /></template>{{ plan.name }}<template #subtitle>{{ fa(trial.gb) }} گیگابایت · {{ fa(trial.days) }} روز · رایگان</template></Cell>
        <Cell multiline><template #description>برای هر پلن فقط یک‌بار می‌تونی تست بگیری. بعد از ساخت، قابل تکرار نیست.</template>مطمئنی؟</Cell>
        <div class="pad cta"><Button stretched size="l" :loading="busy" @click="takeTrial">تایید و دریافت تست</Button></div>
      </div>
    </Modal>

    <Modal v-model:open="confirming">
      <template #header><ModalHeader>تایید خرید</ModalHeader></template>
      <div class="sheet">
        <Cell><template #before><ToneIcon :icon="plan.icon" :tone="plan.tone" :size="44" :emoji="plan.emojiId" /></template>{{ plan.name }}<template #subtitle><span class="ltr">{{ prefix }}-{{ name }}</span></template></Cell>
        <Cell><template #after><span class="num">{{ isUnlimited(plan) ? 'نامحدود' : gb(size) }}</span></template>حجم</Cell>
        <Cell><template #after><span class="num">{{ fa(plan.days[daysIndex]) }} روز</span></template>زمان</Cell>
        <Cell><template #after><b class="num total">{{ toman(price) }}</b></template>از کیف پول کسر می‌شه</Cell>
        <div class="pad cta"><Button stretched size="l" :loading="busy" @click="buy">پرداخت و ساخت سرویس</Button></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.trial-note { margin: 0 4px var(--block-gap); font-size: 12px; line-height: 1.7; color: var(--tgui-hint-color); text-align: center; }
.total { color: var(--tgui-link-color); }
.err { color: var(--tgui-destructive-text-color); }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.cta { margin-top: 12px; }
</style>
