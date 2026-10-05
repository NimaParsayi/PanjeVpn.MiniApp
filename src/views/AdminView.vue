<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FButton from '@/components/FButton.vue'
import FField from '@/components/FField.vue'
import FSheet from '@/components/FSheet.vue'
import FMessageBar from '@/components/FMessageBar.vue'
import { api, ApiError, type BulkResult } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { fa } from '@/utils/format'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const text = ref('')
const confirming = ref(false)
const busy = ref(false)
const result = ref<BulkResult | null>(null)

async function send() {
  busy.value = true
  try {
    result.value = await api.sendBulkMessage(text.value.trim())
    confirming.value = false
    text.value = ''
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { busy.value = false }
}
</script>

<template>
  <div class="view">
    <PageHeader title="پیام همگانی" subtitle="پنل ادمین" back="/" />
    <main class="page no-nav">
      <FCard padding="lg">
        <FField v-model="text" multiline :rows="7" label="متن پیام" placeholder="پیام مورد نظرت رو بنویس…" hint="برای همه‌ی کاربران ربات ارسال می‌شه." />
      </FCard>

      <FCard v-if="result" padding="lg" class="res">
        <div class="stat"><b class="num">{{ fa(result.total) }}</b><span>کل کاربران</span></div>
        <div class="stat ok"><b class="num">{{ fa(result.success) }}</b><span>موفق</span></div>
        <div class="stat bad"><b class="num">{{ fa(result.failed) }}</b><span>ناموفق</span></div>
      </FCard>

      <div class="sticky-cta">
        <FButton appearance="primary" size="lg" block icon="send" :disabled="!text.trim()" @click="confirming = true">ارسال به همه</FButton>
      </div>
    </main>

    <FSheet :open="confirming" title="ارسال پیام همگانی؟" @close="!busy && (confirming = false)">
      <FMessageBar intent="warning">این پیام برای همه‌ی کاربران ارسال می‌شه و قابل بازگشت نیست.</FMessageBar>
      <FCard padding="md" style="margin-top: 12px"><p class="prev">{{ text }}</p></FCard>
      <template #footer><FButton appearance="primary" size="lg" block :loading="busy" @click="send">تایید و ارسال</FButton></template>
    </FSheet>
  </div>
</template>

<style scoped>
.res { display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; }
.stat { display: flex; flex-direction: column; gap: 2px; } .stat b { font: var(--t-title3); } .stat span { font: var(--t-caption); color: var(--fg-3); }
.ok b { color: var(--success-fg); } .bad b { color: var(--danger-fg); }
.prev { white-space: pre-wrap; max-height: 160px; overflow: auto; font-size: 13px; }
</style>
