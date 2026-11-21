<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Banner, Button, Cell, Input, List, Placeholder, Section } from 'telegram-ui-vue'
import Tag from '@/components/Tag.vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import CopyCell from '@/components/CopyCell.vue'
import { api, ApiError, type CardDeposit, type StarsDeposit, type TonDeposit } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { confetti } from '@/utils/confetti'
import { haptic, openInvoice, openLink } from '@/telegram/webapp'
import { asciiDigits, compactToman, countdown, fa, faDigits, toman } from '@/utils/format'

const MIN = 200_000
const presets = [200_000, 300_000, 500_000, 600_000, 800_000, 1_000_000, 1_500_000, 2_000_000]

const route = useRoute()
const router = useRouter()
const app = useApp()
const ui = useUi()
const method = computed(() => route.params.method as 'ton' | 'stars' | 'card')

type Step = 'amount' | 'pay' | 'done'
const step = ref<Step>('amount')
const amount = ref(500_000)
const custom = ref('')
const busy = ref(false)
const checking = ref(false)

const ton = ref<TonDeposit | null>(null)
const stars = ref<StarsDeposit | null>(null)
const card = ref<CardDeposit | null>(null)
const cardNote = ref<string | null>(null)
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
let poll: ReturnType<typeof setInterval> | undefined
onBeforeUnmount(() => { clearInterval(timer); clearInterval(poll) })

const left = computed(() => (ton.value ? new Date(ton.value.expiresAt).getTime() - now.value : 0))
const expired = computed(() => !!ton.value && left.value <= 0)

const customValue = computed(() => Number(asciiDigits(custom.value).replace(/\D/g, '')) || 0)
const customError = computed(() => (custom.value && customValue.value < MIN ? `حداقل مبلغ شارژ ${toman(MIN)} است` : ''))
const finalAmount = computed(() => (custom.value ? customValue.value : amount.value))
const canContinue = computed(() => finalAmount.value >= MIN)

function pick(v: number) { haptic.select(); amount.value = v; custom.value = '' }

async function start() {
  busy.value = true
  try {
    if (method.value === 'ton') {
      ton.value = await api.startTonDeposit(finalAmount.value)
      now.value = Date.now()
      timer = setInterval(() => (now.value = Date.now()), 1000)
    } else if (method.value === 'card') {
      card.value = await api.startCardDeposit(finalAmount.value)
      startPolling()
    } else {
      stars.value = await api.startStarsDeposit(finalAmount.value)
    }
    step.value = 'pay'
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { busy.value = false }
}

async function finish() {
  clearInterval(timer)
  clearInterval(poll)
  await app.refreshMe()
  step.value = 'done'
  haptic.success()
  confetti()
}

async function checkTon() {
  if (!ton.value) return
  checking.value = true
  try {
    if ((await api.checkDeposit(ton.value.transactionId)).paid) await finish()
    else ui.toast('هنوز پرداختت ثبت نشده!', 'warning')
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { checking.value = false }
}

// Card payments are confirmed by the gateway a while after the user pays, so keep asking every few seconds.
function startPolling() {
  clearInterval(poll)
  poll = setInterval(() => void checkCard(true), 10000)
}

async function checkCard(silent = false) {
  if (!card.value || checking.value) return
  checking.value = !silent
  try {
    const r = await api.checkDeposit(card.value.transactionId)
    cardNote.value = r.note
    if (r.paid) await finish()
    else if (r.status === 'failed') { clearInterval(poll); ui.toast(r.note ?? 'پرداخت انجام نشد', 'error', 4000) }
    else if (!silent) ui.toast(r.note ?? 'هنوز پرداختت ثبت نشده!', 'warning', 3500)
  } catch (e) {
    if (!silent) ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { checking.value = false }
}

async function payStars() {
  if (!stars.value) return
  const status = await openInvoice(stars.value.invoiceLink)
  if (status === 'paid') {
    // Telegram tells the bot first; the wallet is credited by its webhook, so wait for it briefly.
    checking.value = true
    try {
      for (let i = 0; i < 12; i++) {
        if ((await api.checkDeposit(stars.value.transactionId)).paid) return await finish()
        await new Promise((r) => setTimeout(r, 1000))
      }
      ui.toast('پرداختت ثبت شد؛ چند لحظه‌ی دیگه موجودی بروز می‌شه.', 'info', 4000)
      await app.refreshMe()
    } catch (e) {
      ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
    } finally { checking.value = false }
  } else if (status === 'cancelled') ui.toast('پرداخت لغو شد', 'info')
  else if (status === 'failed') ui.toast('پرداخت ناموفق بود', 'error')
}
</script>

<template>
  <div class="screen">
    <PageTitle :title="method === 'ton' ? 'شارژ با TON' : method === 'card' ? 'شارژ کارت به کارت' : 'شارژ با Stars'" subtitle="افزایش موجودی کیف پول" back />

    <template v-if="step === 'amount'">
      <List>
        <Section>
          <template #header>مقدار مورد نظر برای شارژ</template>
          <div class="chips">
            <Button v-for="p in presets" :key="p" :mode="!custom && amount === p ? 'filled' : 'gray'" size="m" @click="pick(p)">
              <span class="num">{{ compactToman(p) }}</span>&nbsp;<small>تومان</small>
            </Button>
          </div>
        </Section>
        <Section>
          <template #header>مبلغ دلخواه</template>
          <Input :value="custom" inputmode="numeric" placeholder="مثلاً ۷۵۰۰۰۰" :status="customError ? 'error' : 'default'" @input="custom = faDigits(asciiDigits(($event.target as HTMLInputElement).value).replace(/\D/g, ''))">
            <template #after><span class="hint">تومان</span></template>
          </Input>
          <template #footer><span :class="{ bad: !!customError }">{{ customError || `حداقل ${toman(MIN)}` }}</span></template>
        </Section>
      </List>
      <div class="action-bar">
        <Button stretched size="l" :disabled="!canContinue" :loading="busy" @click="start">ادامه · {{ toman(finalAmount) }}</Button>
      </div>
    </template>

    <List v-else-if="step === 'pay' && method === 'ton' && ton">
      <Section>
        <Cell>
          <template #before><ToneIcon icon="ton" tone="primary" :emoji="E.ton" /></template>
          شارژ کیف پول
          <template #subtitle><span class="num">{{ toman(ton.priceToman) }}</span></template>
          <template #after><Tag :tone="expired ? 'danger' : left < 300000 ? 'warning' : 'info'" dot><span class="num">{{ expired ? 'منقضی شد' : countdown(left) }}</span></Tag></template>
        </Cell>
      </Section>
      <Banner type="section">
        <template #before><TgEmoji :id="E.warning" fallback="warning" :size="32" /></template>
        <template #header>حتماً با ممو واریز کن</template>
        <template #subheader>مقدار دقیق <b class="num ltr">{{ ton.priceTon }}</b> TON رو به آدرس زیر و با ممو/تگ خودت ارسال کن. این پرداخت فقط تا ۳۰ دقیقه معتبره.</template>
      </Banner>
      <Section>
        <CopyCell label="مقدار (TON)" :value="String(ton.priceTon)" :display="`${ton.priceTon} TON`" ltr />
        <CopyCell label="آدرس والت" :value="ton.walletAddress" ltr />
        <CopyCell label="ممو / تگ (اجباری)" :value="ton.memo" ltr />
      </Section>
      <div class="pad">
        <Button v-if="!expired" stretched size="l" :loading="checking" @click="checkTon"><template #before><FIcon name="checkCircle" :size="20" /></template>پرداخت کردم</Button>
        <Button v-else stretched size="l" @click="step = 'amount'"><template #before><FIcon name="refresh" :size="20" /></template>شروع دوباره</Button>
      </div>
    </List>

    <List v-else-if="step === 'pay' && method === 'card' && card">
      <Section>
        <Cell>
          <template #before><ToneIcon icon="coin" tone="primary" :emoji="E.coin" /></template>
          شارژ کیف پول
          <template #subtitle><span class="num">{{ toman(card.priceToman) }}</span></template>
        </Cell>
      </Section>
      <Banner type="section">
        <template #before><TgEmoji :id="E.warning" fallback="warning" :size="32" /></template>
        <template #header>دقیقاً این مبلغ رو واریز کن</template>
        <template #subheader><b class="num">{{ toman(card.payToman) }}</b> — از صفحه‌ی پرداخت، شماره کارت مقصد رو می‌بینی. بعد از تأیید، کیف پولت خودکار شارژ می‌شه.</template>
      </Banner>
      <div class="pad pay-btns">
        <Button stretched size="l" @click="openLink(card.payUrl)"><template #before><FIcon name="link" :size="20" /></template>رفتن به صفحه پرداخت</Button>
        <Button stretched size="l" mode="bezeled" :loading="checking" @click="checkCard()"><template #before><FIcon name="checkCircle" :size="20" /></template>پرداخت کردم</Button>
      </div>
      <Section v-if="cardNote"><Cell multiline>{{ cardNote }}</Cell></Section>
    </List>

    <List v-else-if="step === 'pay' && stars">
      <Placeholder>
        <template #header><span class="num">{{ fa(stars.priceStars) }}</span> Stars</template>
        <template #description>معادل {{ toman(stars.priceToman) }}. با زدن دکمه‌ی زیر فاکتور استارز تلگرام باز می‌شه و بعد از پرداخت، موجودی همون لحظه شارژ می‌شه.</template>
        <TgEmoji :id="E.stars" fallback="star" :size="120" loop />
        <template #action><Button size="l" :loading="checking" @click="payStars"><template #before><FIcon name="star" :size="20" /></template>پرداخت با Stars</Button></template>
      </Placeholder>
    </List>

    <List v-else>
      <Placeholder>
        <template #header>کیف پولت شارژ شد!</template>
        <template #description>{{ toman(finalAmount) }} به موجودیت اضافه شد. موجودی جدید: <b class="num">{{ toman(app.me!.wallet) }}</b></template>
        <TgEmoji :id="E.paid" fallback="check" :size="120" />
        <template #action>
          <div class="done-btns">
            <Button stretched size="l" @click="router.replace('/buy')"><template #before><FIcon name="cart" :size="18" /></template>خرید سرویس</Button>
            <Button stretched size="l" mode="gray" @click="router.replace('/wallet')">برگشت به کیف پول</Button>
          </div>
        </template>
      </Placeholder>
    </List>
  </div>
</template>

<style scoped>
.chips { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px 16px 12px; }
.hint { color: var(--tgui-hint-color); padding-inline-end: 12px; font-size: 13px; }
.bad { color: var(--tgui-destructive-text-color); }
.pay-btns { display: flex; flex-direction: column; gap: 8px; }
.done-btns { display: flex; flex-direction: column; gap: 8px; width: 100%; min-width: 240px; }
small { opacity: .75; }
</style>
