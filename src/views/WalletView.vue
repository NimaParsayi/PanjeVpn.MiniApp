<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FIcon from '@/components/FIcon.vue'
import FButton from '@/components/FButton.vue'
import FMessageBar from '@/components/FMessageBar.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { useApp } from '@/stores/app'
import { fa, toman } from '@/utils/format'
import { openLink } from '@/telegram/webapp'
import { useCountUp } from '@/utils/useCountUp'
import { computed } from 'vue'

const app = useApp()
const balance = useCountUp(computed(() => app.me!.wallet))
</script>

<template>
  <div class="view">
    <PageHeader title="کیف پول" subtitle="شارژ و مدیریت موجودی" />
    <main class="page">
      <FCard tone="brand" padding="lg" class="hero"><span class="coin"><FIcon name="wallet" :size="30" /></span>
        <span class="lbl">موجودی فعلی</span>
        <div class="amount num">{{ fa(balance) }}<small>تومان</small></div>
        <div class="sub num">حداقل شارژ: {{ toman(200000) }}</div>
      </FCard>

      <div class="section-title"><span>افزایش موجودی</span></div>
      <FCard interactive padding="md" @click="$router.push('/wallet/deposit/ton')">
        <div class="row">
          <ToneIcon icon="ton" tone="primary" />
          <div class="grow"><b>رمزارز TON</b><div class="muted cap">پرداخت با تون‌کوین و تایید خودکار</div></div>
          <FIcon name="chevronEnd" :size="18" class="chev" />
        </div>
      </FCard>
      <FCard interactive padding="md" @click="$router.push('/wallet/deposit/stars')">
        <div class="row">
          <ToneIcon icon="star" tone="success" />
          <div class="grow"><b>استارز تلگرام</b><div class="muted cap">پرداخت مستقیم داخل تلگرام</div></div>
          <FIcon name="chevronEnd" :size="18" class="chev" />
        </div>
      </FCard>

      <FMessageBar intent="info">
        برای میزان شارژ کمتر از ۲۰۰,۰۰۰ تومان به پشتیبانی مراجعه کن (که قطعاً زمان‌برتر از پرداخت مستقیم داخل اپه).
        <template #action><FButton size="sm" icon="headset" @click="openLink('https://t.me/FiaSupport')">پشتیبانی</FButton></template>
      </FMessageBar>

      <FCard interactive padding="md" @click="$router.push('/gift')">
        <div class="row">
          <ToneIcon icon="gift" tone="danger" />
          <div class="grow"><b>پنجه‌گیفت</b><div class="muted cap">از موجودیت برای دوستات هدیه بساز</div></div>
          <FIcon name="chevronEnd" :size="18" class="chev" />
        </div>
      </FCard>
    </main>
  </div>
</template>

<style scoped>
.hero { position: relative; isolation: isolate; }
.hero::before { content: ''; position: absolute; inset-inline-end: -60px; top: -70px; width: 220px; height: 220px; border-radius: 50%; z-index: -1; background: radial-gradient(circle, color-mix(in srgb, var(--fg-on-brand) 28%, transparent), transparent 66%); }
.coin { position: absolute; inset-inline-end: var(--s-xl); top: var(--s-xl); width: 52px; height: 52px; display: grid; place-items: center; border-radius: 30%; background: color-mix(in srgb, var(--fg-on-brand) 18%, transparent); }
.lbl { opacity: .92; font: var(--t-body); }
.amount { font: var(--t-hero); font-size: 42px; line-height: 56px; display: flex; align-items: baseline; gap: var(--s-s); margin-top: var(--s-xs); letter-spacing: -0.5px; }
.amount small { font: var(--t-body); opacity: .8; }
.sub { font: var(--t-caption); opacity: .8; margin-top: var(--s-xs); }
.cap { font: var(--t-caption); }
.chev { color: var(--fg-4); }
</style>
