<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Cell, List, Section } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { useApp } from '@/stores/app'
import { E } from '@/emoji/ids'

const router = useRouter()
const app = useApp()
if (!app.me?.isAdmin) router.replace('/')
</script>

<template>
  <div class="screen">
    <PageTitle title="پنل ادمین" subtitle="مدیریت ربات پنجه" back />
    <List>
      <Section>
        <template #header>امکانات</template>
        <Cell @click="router.push('/admin/stats')">
          <template #before><ToneIcon icon="chart" tone="primary" :emoji="E.services" /></template>
          آمار
          <template #subtitle>کاربران، سرویس‌ها، موجودی و واریزی‌ها</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="router.push('/admin/charge')">
          <template #before><ToneIcon icon="wallet" tone="success" :emoji="E.walletTopUp" /></template>
          شارژ حساب مشتری
          <template #subtitle>افزایش موجودی کیف پول با شناسه یا یوزرنیم</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="router.push('/admin/services')">
          <template #before><ToneIcon icon="shieldCheck" tone="primary" :emoji="E.receipt" /></template>
          سرویس‌های پنجه
          <template #subtitle>همه‌ی سرویس‌های ساخته‌شده، با جست‌وجو</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
        <Cell @click="router.push('/admin/broadcast')">
          <template #before><ToneIcon icon="megaphone" tone="danger" :emoji="E.broadcast" /></template>
          پیام همگانی
          <template #subtitle>ارسال پیام برای همه‌ی کاربران</template>
          <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
        </Cell>
      </Section>
    </List>
  </div>
</template>

<style scoped>.chev { color: var(--tgui-hint-color); }</style>
