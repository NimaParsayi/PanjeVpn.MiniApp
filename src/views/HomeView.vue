<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FIcon from '@/components/FIcon.vue'
import FButton from '@/components/FButton.vue'
import FBadge from '@/components/FBadge.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import ServiceItem from '@/components/ServiceItem.vue'
import FSkeleton from '@/components/FSkeleton.vue'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { copyText, cyclePalette, haptic, isTelegram, openLink } from '@/telegram/webapp'
import { useCountUp } from '@/utils/useCountUp'
import { fa } from '@/utils/format'

const app = useApp()
const ui = useUi()
const me = computed(() => app.me!)
const recent = computed(() => app.services.slice(0, 2))

const balance = useCountUp(computed(() => me.value.wallet))
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 5 ? 'شب بخیر' : h < 12 ? 'صبح بخیر' : h < 17 ? 'ظهر بخیر' : h < 20 ? 'عصر بخیر' : 'شب بخیر'
})

function nextPalette() {
  haptic.select()
  ui.toast(`پالت نمونه: ${cyclePalette()}`, 'info', 1400)
}

async function copyId() {
  await copyText(String(me.value.telegramId))
  haptic.tap()
  ui.toast('شناسه کپی شد', 'success', 1500)
}

const actions = [
  { to: '/buy', icon: 'cart', label: 'خرید سرویس', sub: 'ساخت کانفیگ جدید', tone: 'success' as const },
  { to: '/services', icon: 'shieldCheck', label: 'سرویس‌های من', sub: 'مصرف و تمدید', tone: 'primary' as const },
  { to: '/gift', icon: 'gift', label: 'پنجه‌گیفت', sub: 'شارژ هدیه برای دوستان', tone: 'danger' as const },
]
</script>

<template>
  <div class="view">
    <PageHeader title="پنجه VPN" :subtitle="`${greeting} ${me.displayName} 👋`">
      <button v-if="!isTelegram" class="theme" type="button" aria-label="تغییر پالت رنگی" title="پیش‌نمایش تم‌های تلگرام" @click="nextPalette"><FIcon name="sparkle" :size="20" /></button>
    </PageHeader>

    <main class="page">
      <FCard tone="brand" padding="lg" class="hero">
        <div class="hero-top">
          <span class="lbl"><FIcon name="wallet" :size="18" /> موجودی کیف پول</span>
          <button class="idchip" type="button" @click="copyId"><FIcon name="user" :size="14" /><span class="num">{{ me.telegramId }}</span><FIcon name="copy" :size="14" /></button>
        </div>
        <div class="amount num">{{ fa(balance) }}<small>تومان</small></div>
        <div class="hero-actions">
          <FButton size="sm" icon="plus" class="light" @click="$router.push('/wallet/deposit/ton')">افزایش موجودی</FButton>
          <FButton size="sm" appearance="subtle" class="ghost" icon="wallet" @click="$router.push('/wallet')">جزئیات</FButton>
        </div>
      </FCard>

      <div class="grid">
        <FCard v-for="a in actions" :key="a.to" interactive padding="md" class="act" @click="$router.push(a.to)">
          <ToneIcon :icon="a.icon" :tone="a.tone" :size="36" />
          <b>{{ a.label }}</b>
          <span class="muted">{{ a.sub }}</span>
        </FCard>
        <FCard interactive padding="md" class="act" @click="openLink('https://t.me/FiaSupport')">
          <ToneIcon icon="headset" tone="neutral" :size="36" />
          <b>پشتیبانی</b>
          <span class="muted">گفتگو در تلگرام</span>
        </FCard>
      </div>

      <template v-if="recent.length">
        <div class="section-title"><span>سرویس‌های اخیر</span><FButton size="sm" appearance="subtle" iconEnd="chevronEnd" @click="$router.push('/services')">همه</FButton></div>
        <ServiceItem v-for="s in recent" :key="s.id" :service="s" />
      </template>
      <FSkeleton v-else-if="app.servicesLoading" :h="96" :r="20" />
      <FCard v-else interactive padding="md" @click="$router.push('/buy')">
        <div class="row">
          <ToneIcon icon="sparkle" tone="primary" />
          <div class="grow"><b>هنوز سرویسی نداری</b><div class="muted">اولین سرویستو بخر و متصل شو</div></div>
          <FIcon name="chevronEnd" :size="18" />
        </div>
      </FCard>

      <FCard interactive padding="md" @click="ui.toast('این قابلیت موقتاً خاموش است.', 'info')">
        <div class="row">
          <ToneIcon icon="people" tone="neutral" />
          <div class="grow"><b>درآمدزایی</b><div class="muted">دعوت دوستان و دریافت پورسانت</div></div>
          <FBadge tone="neutral">به‌زودی</FBadge>
        </div>
      </FCard>

      <FCard v-if="me.isAdmin" interactive padding="md" @click="$router.push('/admin')">
        <div class="row">
          <ToneIcon icon="megaphone" tone="danger" />
          <div class="grow"><b>پنل ادمین</b><div class="muted">ارسال پیام همگانی</div></div>
          <FIcon name="chevronEnd" :size="18" />
        </div>
      </FCard>

      <p class="foot muted">
        <FIcon name="shieldCheck" :size="16" /> همه سرویس‌ها با بیشترین تلاش برای پایداری و سرعت ارائه می‌شن.
      </p>
      <p v-if="me.isReseller" class="foot muted">حساب نماینده: {{ me.resellerTitle }} · تعرفه‌ی ویژه فعال است</p>
    </main>
  </div>
</template>

<style scoped>
.theme { width: 40px; height: 40px; display: grid; place-items: center; border: 0; border-radius: 50%; background: var(--bg-1); box-shadow: var(--shadow-2); color: var(--fg-brand); cursor: pointer; transition: transform var(--dur-normal) var(--ease-spring); }
.theme:active { transform: rotate(40deg) scale(0.9); }
.hero { position: relative; isolation: isolate; }
.hero::before, .hero::after { content: ''; position: absolute; border-radius: 50%; z-index: -1; pointer-events: none; }
.hero::before { inset-inline-end: -70px; top: -80px; width: 240px; height: 240px; background: radial-gradient(circle, color-mix(in srgb, var(--fg-on-brand) 30%, transparent), transparent 66%); animation: float 9s ease-in-out infinite; }
.hero::after { inset-inline-start: -50px; bottom: -90px; width: 200px; height: 200px; background: radial-gradient(circle, color-mix(in srgb, var(--fg-on-brand) 16%, transparent), transparent 66%); animation: float 11s ease-in-out infinite reverse; }
@keyframes float { 50% { transform: translate(-14px, 12px) scale(1.08); } }
.hero-top { display: flex; align-items: center; justify-content: space-between; }
.lbl { display: inline-flex; align-items: center; gap: var(--s-s); font: var(--t-body); opacity: .92; }
.idchip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px; border-radius: var(--r-full); border: 0; background: color-mix(in srgb, var(--fg-on-brand) 18%, transparent); color: inherit; font: var(--t-caption); cursor: pointer; backdrop-filter: blur(8px); }
.amount { font: var(--t-hero); font-size: 40px; line-height: 52px; margin: var(--s-m) 0 var(--s-l); display: flex; align-items: baseline; gap: var(--s-s); letter-spacing: -0.5px; }
.amount small { font: var(--t-body); opacity: .8; }
.hero-actions { display: flex; gap: var(--s-s); }
.hero-actions .light { background: var(--fg-on-brand); color: color-mix(in srgb, var(--p-button) 75%, black); box-shadow: 0 6px 16px rgba(0,0,0,.18); }
.hero-actions .light:hover { background: color-mix(in srgb, var(--fg-on-brand) 90%, transparent); }
.hero-actions .ghost { color: inherit; background: color-mix(in srgb, var(--fg-on-brand) 16%, transparent); }
.hero-actions .ghost:hover { background: color-mix(in srgb, var(--fg-on-brand) 26%, transparent); color: inherit; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-m); }
.act { display: flex; flex-direction: column; gap: var(--s-xs); }
.act :deep(.tone) { margin-bottom: var(--s-s); }
.act b { font: var(--t-body-strong); }
.act .muted { font: var(--t-caption); }
.foot { display: flex; align-items: center; justify-content: center; gap: var(--s-s); font: var(--t-caption); text-align: center; margin-top: var(--s-s); }
</style>
