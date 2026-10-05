<script setup lang="ts">
import { confetti } from '@/utils/confetti'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FButton from '@/components/FButton.vue'
import FField from '@/components/FField.vue'
import FIcon from '@/components/FIcon.vue'
import FMessageBar from '@/components/FMessageBar.vue'
import CopyRow from '@/components/CopyRow.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { api, ApiError, type StarsDeposit, type TonDeposit } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { haptic, openInvoice } from '@/telegram/webapp'
import { countdown, fa, toman } from '@/utils/format'

const MIN = 200_000
const presets = [200_000, 300_000, 500_000, 600_000, 800_000, 1_000_000, 1_500_000, 2_000_000]

const route = useRoute()
const router = useRouter()
const app = useApp()
const ui = useUi()
const method = computed(() => route.params.method as 'ton' | 'stars')

type Step = 'amount' | 'pay' | 'done'
const step = ref<Step>('amount')
const amount = ref(500_000)
const custom = ref('')
const busy = ref(false)
const checking = ref(false)

const ton = ref<TonDeposit | null>(null)
const stars = ref<StarsDeposit | null>(null)
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onBeforeUnmount(() => clearInterval(timer))

const left = computed(() => (ton.value ? new Date(ton.value.expiresAt).getTime() - now.value : 0))
const expired = computed(() => !!ton.value && left.value <= 0)

const digits = (s: string) => s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/\D/g, '')
const customValue = computed(() => Number(digits(custom.value)) || 0)
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
  await app.refreshMe()
  step.value = 'done'
  haptic.success()
  confetti()
}

async function checkTon() {
  if (!ton.value) return
  checking.value = true
  try {
    if (await api.checkDeposit(ton.value.transactionId)) await finish()
    else ui.toast('هنوز پرداختت ثبت نشده!', 'warning')
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
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
        if (await api.checkDeposit(stars.value.transactionId)) return await finish()
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
  <div class="view">
    <PageHeader :title="method === 'ton' ? 'شارژ با TON' : 'شارژ با Stars'" subtitle="افزایش موجودی کیف پول" back="/wallet" />

    <main v-if="step === 'amount'" class="page no-nav">
      <div class="section-title"><span>مقدار مورد نظر برای شارژ</span></div>
      <div class="chips">
        <button
          v-for="p in presets" :key="p" type="button" class="chip num" :class="{ on: !custom && amount === p }" @click="pick(p)"
        >{{ fa(p) }}<small>تومان</small></button>
      </div>
      <FCard padding="md">
        <FField v-model="custom" label="مبلغ دلخواه" inputmode="numeric" suffix="تومان" placeholder="مثلاً ۷۵۰۰۰۰" :error="customError" />
      </FCard>
      <div class="sticky-cta">
        <FButton appearance="primary" size="lg" block :disabled="!canContinue" :loading="busy" iconEnd="chevronEnd" @click="start">
          ادامه · {{ toman(finalAmount) }}
        </FButton>
      </div>
    </main>

    <main v-else-if="step === 'pay' && method === 'ton' && ton" class="page no-nav">
      <FCard padding="lg" class="head">
        <div class="row">
          <ToneIcon icon="ton" tone="primary" />
          <div class="grow"><b>شارژ کیف پول</b><div class="muted cap num">{{ toman(ton.priceToman) }}</div></div>
          <div class="timer num" :class="{ end: expired }"><FIcon name="clock" :size="14" /> {{ expired ? 'منقضی شد' : countdown(left) }}</div>
        </div>
      </FCard>

      <FMessageBar intent="warning" title="حتماً با ممو واریز کن">
        مقدار دقیق <b class="num ltr">{{ ton.priceTon }}</b> TON رو به آدرس زیر و <b>با ممو/تگ خودت</b> ارسال کن. این پرداخت فقط تا ۳۰ دقیقه معتبره.
      </FMessageBar>

      <CopyRow label="مقدار (TON)" :value="String(ton.priceTon)" :display="`${ton.priceTon} TON`" ltr />
      <CopyRow label="آدرس والت" :value="ton.walletAddress" ltr />
      <CopyRow label="ممو / تگ (اجباری)" :value="ton.memo" ltr />

      <div class="sticky-cta">
        <FButton v-if="!expired" appearance="success" size="lg" block icon="checkCircle" :loading="checking" @click="checkTon">پرداخت کردم</FButton>
        <FButton v-else appearance="primary" size="lg" block icon="refresh" @click="step = 'amount'">شروع دوباره</FButton>
      </div>
    </main>

    <main v-else-if="step === 'pay' && stars" class="page no-nav">
      <FCard padding="lg" class="stars">
        <ToneIcon icon="star" tone="success" :size="56" />
        <div class="num big">{{ fa(stars.priceStars) }} <small>Stars</small></div>
        <div class="muted num">معادل {{ toman(stars.priceToman) }}</div>
      </FCard>
      <FMessageBar intent="info">با زدن دکمه‌ی زیر، فاکتور استارز تلگرام باز می‌شه. بعد از پرداخت، موجودی همون لحظه شارژ می‌شه.</FMessageBar>
      <div class="sticky-cta"><FButton appearance="primary" size="lg" block icon="star" :loading="checking" @click="payStars">پرداخت با Stars</FButton></div>
    </main>

    <main v-else class="page no-nav">
      <FCard padding="lg" class="done">
        <span class="okc"><FIcon name="check" :size="34" :stroke="2.4" /></span>
        <h2>کیف پولت شارژ شد!</h2>
        <p class="muted">{{ toman(finalAmount) }} به موجودیت اضافه شد.</p>
        <div class="bal num">موجودی جدید: <b>{{ toman(app.me!.wallet) }}</b></div>
      </FCard>
      <FButton appearance="primary" size="lg" block icon="cart" @click="router.replace('/buy')">خرید سرویس</FButton>
      <FButton block @click="router.replace('/wallet')">برگشت به کیف پول</FButton>
    </main>
  </div>
</template>

<style scoped>
.chips { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-s); }
.chip { display: flex; flex-direction: column; align-items: center; padding: var(--s-m) 0; background: var(--card-bg); border: 1px solid var(--stroke-2); border-radius: var(--r-lg); font: var(--t-subtitle2); cursor: pointer; transition: all var(--dur-fast) var(--ease-point); }
.chip small { font: var(--t-caption); color: var(--fg-3); }
.chip:hover { background: var(--bg-subtle-hover); }
.chip.on { background: var(--brand-bg-tint); border-color: var(--brand-stroke); box-shadow: inset 0 0 0 1px var(--brand-stroke); color: var(--fg-brand); }
.cap { font: var(--t-caption); }
.timer { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: var(--r-full); background: var(--brand-bg-tint); color: var(--fg-brand); font: var(--t-caption); font-weight: 600; }
.timer.end { background: var(--danger-bg); color: var(--danger-fg); }
.stars { display: flex; flex-direction: column; align-items: center; gap: var(--s-s); text-align: center; }
.big { font: var(--t-title2); } .big small { font: var(--t-body); color: var(--fg-3); }
.done { display: flex; flex-direction: column; align-items: center; gap: var(--s-s); text-align: center; padding-block: var(--s-xxxl); }
.okc { width: 72px; height: 72px; border-radius: 50%; display: grid; place-items: center; background: var(--success-solid); color: #fff; animation: pop var(--dur-slow) var(--ease-decel); box-shadow: 0 0 0 8px var(--success-bg); }
.done h2 { font: var(--t-title3); margin-top: var(--s-m); }
.bal { margin-top: var(--s-m); padding: var(--s-s) var(--s-l); border-radius: var(--r-full); background: var(--bg-4); }
@keyframes pop { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
