<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import ServiceItem from '@/components/ServiceItem.vue'
import FEmpty from '@/components/FEmpty.vue'
import FButton from '@/components/FButton.vue'
import FSkeleton from '@/components/FSkeleton.vue'
import { useApp } from '@/stores/app'
import { fa } from '@/utils/format'

const app = useApp()
const busy = ref(false)
async function refresh() { busy.value = true; try { await app.refreshServices() } finally { busy.value = false } }
onMounted(refresh)
</script>

<template>
  <div class="view">
    <PageHeader title="سرویس‌های من" :subtitle="app.services.length ? `${fa(app.services.length)} سرویس` : undefined">
      <FButton appearance="subtle" size="sm" icon="refresh" :loading="busy" aria-label="بروزرسانی" @click="refresh" />
    </PageHeader>
    <main class="page">
      <template v-if="app.services.length">
        <p class="muted hint">با انتخاب هر سرویس مشخصات، حجم و زمان باقی‌مانده رو می‌بینی.</p>
        <ServiceItem v-for="s in app.services" :key="s.id" :service="s" />
      </template>
      <template v-else-if="busy"><FSkeleton :h="96" :r="8" /><FSkeleton :h="96" :r="8" /></template>
      <FEmpty v-else icon="shieldCheck" title="هنوز سرویسی نداری" text="با خرید اولین سرویس، اینجا لیستشون رو می‌بینی.">
        <FButton appearance="primary" icon="cart" @click="$router.push('/buy')">خرید سرویس</FButton>
      </FEmpty>
    </main>
  </div>
</template>

<style scoped>.hint { font: var(--t-caption); }</style>
