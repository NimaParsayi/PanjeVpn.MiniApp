<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Cell, List, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import Tag from '@/components/Tag.vue'
import { api, ApiError, type AdminStats } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { fa, toman } from '@/utils/format'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const stats = ref<AdminStats | null>(null)
const busy = ref(false)
async function load() {
  busy.value = true
  try { stats.value = await api.getAdminStats() }
  catch (e) { ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error') }
  finally { busy.value = false }
}
onMounted(load)
</script>

<template>
  <div class="screen">
    <PageTitle title="آمار" subtitle="وضعیت کلی ربات" back>
      <Button mode="gray" size="s" aria-label="بروزرسانی" :loading="busy" @click="load"><FIcon name="refresh" :size="18" /></Button>
    </PageTitle>
    <List v-if="stats">
      <Section>
        <template #header>کاربران و سرویس‌ها</template>
        <Cell><template #after><b class="num">{{ fa(stats.users) }}</b></template>کل کاربران<template #subtitle><Tag tone="success" dot>{{ fa(stats.usersLast7Days) }} نفر در ۷ روز اخیر</Tag></template></Cell>
        <Cell><template #after><b class="num">{{ fa(stats.services) }}</b></template>کل سرویس‌ها<template #subtitle><Tag tone="info" dot>{{ fa(stats.servicesLast7Days) }} سرویس در ۷ روز اخیر</Tag></template></Cell>
      </Section>
      <Section>
        <template #header>مالی</template>
        <Cell><template #after><b class="num">{{ toman(stats.walletTotal) }}</b></template>مجموع موجودی کیف پول‌ها</Cell>
        <Cell><template #after><b class="num">{{ toman(stats.depositsTotal) }}</b></template>کل شارژهای ثبت‌شده</Cell>
        <Cell><template #after><b class="num">{{ toman(stats.depositsLast30Days) }}</b></template>شارژ ۳۰ روز اخیر</Cell>
        <Cell><template #after><b class="num">{{ toman(stats.giftsUnusedAmount) }}</b></template>پنجه‌گیفت‌های استفاده‌نشده<template #subtitle>{{ fa(stats.giftsUnused) }} گیفت</template></Cell>
      </Section>
    </List>
    <List v-else><Section><Skeleton visible><div style="height: 260px" /></Skeleton></Section></List>
  </div>
</template>
