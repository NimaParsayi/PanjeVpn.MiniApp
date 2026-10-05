<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Banner, Button, Cell, List, Section } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { useApp } from '@/stores/app'
import { openLink } from '@/telegram/webapp'
import { fa, toman } from '@/utils/format'
import { useCountUp } from '@/utils/useCountUp'

const app = useApp()
const router = useRouter()
const balance = useCountUp(computed(() => app.me!.wallet))
</script>

<template>
  <div class="screen with-tabs">
    <PageTitle title="کیف پول" subtitle="شارژ و مدیریت موجودی" />
    <div class="pad hero-wrap">
      <div class="hero">
        <span class="lbl"><TgEmoji :id="E.walletTopUp" fallback="wallet" :size="26" /> موجودی فعلی</span>
        <div class="amount num">{{ fa(balance) }}<small>تومان</small></div>
        <div class="sub num">حداقل شارژ: {{ toman(200000) }}</div>
      </div>
    </div>

    <List>
      <Section>
        <template #header>افزایش موجودی</template>
        <Cell @click="router.push('/wallet/deposit/ton')">
          <template #before><ToneIcon icon="ton" tone="primary" :emoji="E.ton" /></template>
          رمزارز TON
          <template #subtitle>پرداخت با تون‌کوین و تایید خودکار</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="router.push('/wallet/deposit/stars')">
          <template #before><ToneIcon icon="star" tone="success" :emoji="E.stars" /></template>
          استارز تلگرام
          <template #subtitle>پرداخت مستقیم داخل تلگرام</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <template #footer>برای میزان شارژ کمتر از ۲۰۰,۰۰۰ تومان به پشتیبانی مراجعه کن (که قطعاً زمان‌برتر از پرداخت مستقیم داخل اپه).</template>
      </Section>

      <Section>
        <Cell @click="router.push('/gift')">
          <template #before><ToneIcon icon="gift" tone="danger" :emoji="E.gift" /></template>
          پنجه‌گیفت
          <template #subtitle>از موجودیت برای دوستات هدیه بساز</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="openLink('https://t.me/FiaSupport')">
          <template #before><ToneIcon icon="headset" tone="neutral" :emoji="E.support" /></template>
          پشتیبانی
          <template #subtitle>شارژ کمتر از حداقل و مشکلات پرداخت</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
      </Section>
    </List>
  </div>
</template>

<style scoped>
.chev { color: var(--tgui-hint-color); }
.hero-wrap { margin-bottom: 12px; }
.hero { position: relative; overflow: hidden; isolation: isolate; border-radius: var(--radius-card); padding: 20px;
  background: linear-gradient(135deg, var(--tgui-button-color), color-mix(in oklab, var(--tgui-button-color) 55%, #7a5cff));
  color: var(--tgui-button-text-color); box-shadow: 0 10px 28px color-mix(in srgb, var(--tgui-button-color) 32%, transparent); }
.hero::before { content: ''; position: absolute; inset-inline-end: -60px; top: -70px; width: 220px; height: 220px; border-radius: 50%; z-index: -1; background: radial-gradient(circle, color-mix(in srgb, var(--tgui-button-text-color) 28%, transparent), transparent 66%); }
.lbl { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; opacity: .95; }
.amount { font-size: 38px; font-weight: 700; line-height: 46px; display: flex; align-items: baseline; gap: 8px; margin-top: 8px; }
.amount small { font-size: 14px; font-weight: 400; opacity: .8; }
.sub { font-size: 12px; opacity: .8; margin-top: 2px; }
</style>
