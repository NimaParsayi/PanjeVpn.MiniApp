<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Banner, Button, Cell, List, Modal, ModalHeader, Section, Textarea } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
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
  <div class="screen">
    <PageTitle title="پیام همگانی" subtitle="پنل ادمین" back />
    <List>
      <Section>
        <template #header>متن پیام</template>
        <Textarea :value="text" placeholder="پیام مورد نظرت رو بنویس…" :rows="7" @input="text = ($event.target as HTMLTextAreaElement).value" />
        <template #footer>برای همه‌ی کاربران ربات ارسال می‌شه.</template>
      </Section>

      <Section v-if="result">
        <template #header>نتیجه‌ی ارسال</template>
        <Cell><template #after><b class="num">{{ fa(result.total) }}</b></template>کل کاربران</Cell>
        <Cell><template #after><b class="num ok">{{ fa(result.success) }}</b></template>موفق</Cell>
        <Cell><template #after><b class="num bad">{{ fa(result.failed) }}</b></template>ناموفق</Cell>
      </Section>
    </List>

    <div class="action-bar">
      <Button stretched size="l" :disabled="!text.trim()" @click="confirming = true"><template #before><FIcon name="send" :size="20" /></template>ارسال به همه</Button>
    </div>

    <Modal v-model:open="confirming">
      <template #header><ModalHeader>ارسال پیام همگانی؟</ModalHeader></template>
      <div class="sheet">
        <Banner type="section">
          <template #before><TgEmoji :id="E.warning" fallback="warning" :size="32" /></template>
          <template #header>قابل بازگشت نیست</template>
          <template #subheader>این پیام برای همه‌ی کاربران ارسال می‌شه.</template>
        </Banner>
        <Cell multiline>{{ text }}</Cell>
        <div class="pad cta"><Button stretched size="l" :loading="busy" @click="send">تایید و ارسال</Button></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.ok { color: var(--success); } .bad { color: var(--tgui-destructive-text-color); }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.cta { margin-top: 12px; }
</style>
