<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { computed } from 'vue'
import { Avatar, Button, Cell, Divider, List, Section, Skeleton } from 'telegram-ui-vue'
import Tag from '@/components/Tag.vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import ServiceCell from '@/components/ServiceCell.vue'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { copyText, cyclePalette, haptic, isTelegram, openLink, tgUser } from '@/telegram/webapp'
import { fa } from '@/utils/format'
import { useCountUp } from '@/utils/useCountUp'
import { useRouter } from 'vue-router'

const app = useApp()
const ui = useUi()
const router = useRouter()
const me = computed(() => app.me!)
const recent = computed(() => app.services.slice(0, 3))
const balance = useCountUp(computed(() => me.value.wallet))
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 5 ? 'شب بخیر' : h < 12 ? 'صبح بخیر' : h < 17 ? 'ظهر بخیر' : h < 20 ? 'عصر بخیر' : 'شب بخیر'
})

async function copyId() {
  await copyText(String(me.value.telegramId))
  haptic.tap()
  ui.toast('شناسه کپی شد', 'success', 1500)
}
function nextPalette() {
  haptic.select()
  ui.toast(`پالت نمونه: ${cyclePalette()}`, 'info', 1400)
}
</script>

<template>
  <div class="screen with-tabs">
    <PageTitle :title="`${greeting}، ${me.displayName}`" subtitle="به پنجه خوش اومدی">
      <button v-if="!isTelegram" class="glass-round" type="button" aria-label="تغییر پالت رنگی" @click="nextPalette"><FIcon name="sparkle" :size="20" /></button>
      <Avatar v-else :size="40" :src="tgUser?.photo_url" :acronym="me.displayName.slice(0, 1)" />
    </PageTitle>

    <div class="pad hero-wrap">
      <div class="hero">
        <div class="top">
          <span class="lbl"><TgEmoji :id="E.wallet" fallback="wallet" :size="26" /> موجودی کیف پول</span>
          <button class="idchip" type="button" @click="copyId"><FIcon name="user" :size="14" /><span class="num">{{ me.telegramId }}</span><FIcon name="copy" :size="14" /></button>
        </div>
        <div class="amount num">{{ fa(balance) }}<small>تومان</small></div>
        <div class="acts">
          <Button size="s" mode="white" class="wbtn" @click="router.push('/wallet/deposit/ton')">
            <template #before><FIcon name="plus" :size="16" /></template>افزایش موجودی
          </Button>
          <Button size="s" mode="plain" class="ghost" @click="router.push('/wallet')">جزئیات</Button>
        </div>
      </div>
    </div>

    <List>
      <Section>
        <template #header>دسترسی سریع</template>
        <Cell @click="router.push('/buy')">
          <template #before><ToneIcon icon="cart" tone="success" :emoji="E.buy" /></template>
          خرید سرویس
          <template #subtitle>ساخت کانفیگ جدید</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="router.push('/services')">
          <template #before><ToneIcon icon="shieldCheck" tone="primary" :emoji="E.services" /></template>
          سرویس‌های من
          <template #subtitle>مصرف و تمدید</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="router.push('/gift')">
          <template #before><ToneIcon icon="gift" tone="danger" :emoji="E.gift" /></template>
          پنجه‌گیفت
          <template #subtitle>شارژ هدیه برای دوستان</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="openLink('https://t.me/FiaSupport')">
          <template #before><ToneIcon icon="headset" tone="neutral" :emoji="E.support" /></template>
          پشتیبانی
          <template #subtitle>گفتگو در تلگرام</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="ui.toast('این قابلیت موقتاً خاموش است.', 'info')">
          <template #before><ToneIcon icon="people" tone="neutral" :emoji="E.earn" /></template>
          درآمدزایی
          <template #subtitle>دعوت دوستان و دریافت پورسانت</template>
          <template #after><Tag tone="neutral">به‌زودی</Tag></template>
        </Cell>
        <Cell v-if="me.isAdmin" @click="router.push('/admin')">
          <template #before><ToneIcon icon="megaphone" tone="danger" :emoji="E.broadcast" /></template>
          پنل ادمین
          <template #subtitle>ارسال پیام همگانی</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
      </Section>

      <Section v-if="recent.length">
        <template #header>سرویس‌های اخیر</template>
        <template v-for="(s, i) in recent" :key="s.id">
          <Divider v-if="i" />
          <ServiceCell :service="s" />
        </template>
        <template #footer><a class="more" @click="router.push('/services')">مشاهده‌ی همه‌ی سرویس‌ها</a></template>
      </Section>
      <Section v-else-if="app.servicesLoading">
        <Skeleton visible><div style="height: 88px" /></Skeleton>
      </Section>
    </List>
  </div>
</template>

<style scoped>
.chev { color: var(--tgui-hint-color); }
.more { color: var(--tgui-link-color); cursor: pointer; }
.hero-wrap { margin-bottom: 12px; }
.hero {
  position: relative; overflow: hidden; isolation: isolate; border-radius: var(--radius-card); padding: 20px;
  background: linear-gradient(135deg, var(--tgui-button-color) 0%, color-mix(in oklab, var(--tgui-button-color) 55%, #7a5cff) 100%);
  color: var(--tgui-button-text-color);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 14px 32px color-mix(in srgb, var(--tgui-button-color) 34%, transparent);
}
.hero::before, .hero::after { content: ''; position: absolute; border-radius: 50%; z-index: -1; pointer-events: none; }
.hero::before { inset-inline-end: -60px; top: -70px; width: 220px; height: 220px; background: radial-gradient(circle, color-mix(in srgb, var(--tgui-button-text-color) 30%, transparent), transparent 66%); }
.hero::after { inset-inline-start: -50px; bottom: -80px; width: 180px; height: 180px; background: radial-gradient(circle, color-mix(in srgb, var(--tgui-button-text-color) 16%, transparent), transparent 66%); }
.top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.lbl { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; opacity: .95; }
.idchip { display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 99px; border: 0; background: color-mix(in srgb, var(--tgui-button-text-color) 18%, transparent); color: inherit; font: inherit; font-size: 12px; cursor: pointer; }
.amount { font-size: 36px; font-weight: 700; line-height: 44px; margin: 12px 0 16px; display: flex; align-items: baseline; gap: 8px; }
.amount small { font-size: 14px; font-weight: 400; opacity: .8; }
.acts { display: flex; gap: 8px; }
.wbtn { white-space: nowrap; background: #fff !important; color: color-mix(in srgb, var(--tgui-button-color) 72%, #000) !important; }
.ghost { color: inherit !important; }
</style>
