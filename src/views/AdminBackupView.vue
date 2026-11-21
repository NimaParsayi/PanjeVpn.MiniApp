<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Banner, Button, Cell, Divider, List, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import Tag from '@/components/Tag.vue'
import { api, ApiError, type BackupFile, type Backups } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { haptic } from '@/telegram/webapp'
import { date, fa, timeOfDay } from '@/utils/format'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const data = ref<Backups | null>(null)
const creating = ref(false)
const sending = ref<string | null>(null)

const err = (e: unknown) => ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
const size = (b: number) => (b >= 1024 * 1024 ? `${fa(Math.round((b / 1024 / 1024) * 10) / 10)} مگابایت` : `${fa(Math.max(1, Math.round(b / 1024)))} کیلوبایت`)
const kind = (f: BackupFile) => (f.kind === 'auto' ? 'خودکار' : f.kind === 'pre-restore' ? 'قبل از بازیابی' : 'دستی')

onMounted(async () => { try { data.value = await api.getBackups() } catch (e) { err(e) } })

async function create() {
  creating.value = true
  try { data.value = await api.createBackup(); haptic.success(); ui.toast('بک‌اپ ساخته شد', 'success') }
  catch (e) { err(e) } finally { creating.value = false }
}

async function send(f: BackupFile) {
  sending.value = f.name
  try {
    const r = await api.sendBackup(f.name)
    if (r.sent) { haptic.success(); ui.toast('فایل به چت تلگرامت ارسال شد', 'success') }
    else ui.toast(r.reason ?? 'ارسال انجام نشد', 'error', 3000)
  } catch (e) { err(e) } finally { sending.value = null }
}
</script>

<template>
  <div class="screen">
    <PageTitle title="بک‌اپ" subtitle="نگهداری از اطلاعات ربات" back />
    <List>
      <Section v-if="!data"><Skeleton visible><div style="height: 200px" /></Skeleton></Section>
      <template v-else>
        <Banner type="section">
          <template #before><FIcon name="shield" :size="28" /></template>
          <template #header>{{ data.intervalHours > 0 ? `بک‌اپ خودکار هر ${fa(data.intervalHours)} ساعت` : 'بک‌اپ خودکار خاموشه' }}</template>
          <template #subheader>
            {{ fa(data.keep) }} نسخه روی سرور نگه داشته می‌شه؛ ارسال خودکار به ادمین‌ها در تلگرام {{ data.sendToTelegram ? 'روشنه' : 'خاموشه' }}.
            این موارد از «تنظیمات ربات» (بخش بک‌اپ) تغییر می‌کنن.
          </template>
        </Banner>

        <Section>
          <template #header>نسخه‌ها</template>
          <template v-if="data.items.length">
            <template v-for="(f, i) in data.items" :key="f.name">
              <Divider v-if="i" />
              <Cell multiline @click="send(f)">
                <span class="num">{{ date(f.createdAt) }} · {{ timeOfDay(f.createdAt) }}</span>
                <template #subtitle>{{ size(f.size) }}</template>
                <template #after>
                  <Tag :tone="f.kind === 'pre-restore' ? 'warning' : f.kind === 'auto' ? 'neutral' : 'success'">{{ kind(f) }}</Tag>
                </template>
              </Cell>
            </template>
          </template>
          <Cell v-else>هنوز بک‌اپی ساخته نشده.</Cell>
          <template #footer>با زدن روی هر نسخه، فایلش به چت تلگرام خودت ارسال می‌شه. بازیابی فقط از داخل بات (منوی ادمین ← بک‌اپ و بازیابی) انجام می‌شه.</template>
        </Section>
      </template>
    </List>

    <div class="action-bar">
      <Button stretched size="l" :loading="creating || !!sending" @click="create"><template #before><FIcon name="plus" :size="20" /></template>بک‌اپ همین الان</Button>
    </div>
  </div>
</template>
