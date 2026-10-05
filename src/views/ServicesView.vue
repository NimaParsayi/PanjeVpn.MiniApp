<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Divider, List, Placeholder, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import ServiceCell from '@/components/ServiceCell.vue'
import FIcon from '@/components/FIcon.vue'
import { useApp } from '@/stores/app'
import { fa } from '@/utils/format'

const app = useApp()
const router = useRouter()
onMounted(() => { void app.refreshServices().catch(() => {}) })
</script>

<template>
  <div class="screen with-tabs">
    <PageTitle title="سرویس‌های من" :subtitle="app.services.length ? `${fa(app.services.length)} سرویس` : undefined">
      <Button mode="gray" size="s" aria-label="بروزرسانی" :loading="app.servicesLoading" @click="app.refreshServices()"><FIcon name="refresh" :size="18" /></Button>
    </PageTitle>
    <List>
      <Section v-if="app.services.length">
        <template #footer>با انتخاب هر سرویس مشخصات، حجم و زمان باقی‌مانده رو می‌بینی.</template>
        <template v-for="(s, i) in app.services" :key="s.id">
          <Divider v-if="i" />
          <ServiceCell :service="s" />
        </template>
      </Section>
      <Section v-else-if="app.servicesLoading"><Skeleton visible><div style="height: 96px" /></Skeleton></Section>
      <Placeholder v-else>
        <TgEmoji :id="E.panda" fallback="shieldCheck" :size="120" loop />
        <template #header>هنوز سرویسی نداری</template>
        <template #description>با خرید اولین سرویس، اینجا لیستشون رو می‌بینی.</template>
        <template #action><Button size="m" @click="router.push('/buy')"><template #before><FIcon name="cart" :size="18" /></template>خرید سرویس</Button></template>
      </Placeholder>
    </List>
  </div>
</template>
