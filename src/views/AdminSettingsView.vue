<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Cell, Divider, Input, List, Modal, ModalHeader, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import Tag from '@/components/Tag.vue'
import { api, ApiError, type AdminSetting } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { haptic } from '@/telegram/webapp'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const items = ref<AdminSetting[]>([])
const loading = ref(true)
const editing = ref<AdminSetting | null>(null)
const open = ref(false)
const value = ref('')
const busy = ref(false)

const groups = computed(() => {
  const map = new Map<string, AdminSetting[]>()
  for (const s of items.value) map.set(s.group, [...(map.get(s.group) ?? []), s])
  return [...map.entries()]
})

async function load() {
  try { items.value = await api.getAdminSettings() }
  catch (e) { ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error') }
  finally { loading.value = false }
}
onMounted(load)

function edit(s: AdminSetting) {
  editing.value = s; value.value = ''; open.value = true; haptic.tap()
}

async function save(clear = false) {
  if (!editing.value) return
  if (!clear && !value.value.trim()) { ui.toast('مقدار جدید رو وارد کن.', 'error'); return }
  busy.value = true
  try {
    await api.setAdminSetting(editing.value.key, clear ? '' : value.value.trim())
    haptic.success(); ui.toast(clear ? 'مقدار پاک شد' : 'ذخیره شد', 'success')
    open.value = false
    await load()
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { busy.value = false }
}
</script>

<template>
  <div class="screen">
    <PageTitle title="تنظیمات ربات" subtitle="اطلاعات پنل‌ها و پرداخت" back />
    <List>
      <Section v-if="loading"><Skeleton visible><div style="height: 240px" /></Skeleton></Section>
      <Section v-for="[group, list] in groups" :key="group">
        <template #header>{{ group }}</template>
        <template v-for="(s, i) in list" :key="s.key">
          <Divider v-if="i" />
          <Cell multiline @click="edit(s)">
            {{ s.title }}
            <template #subtitle>
              <span v-if="s.isSet" class="ltr val">{{ s.preview }}</span>
              <span v-else>هنوز تنظیم نشده</span>
            </template>
            <template #after>
              <Tag :tone="s.isSet ? 'success' : 'neutral'">{{ s.isSet ? 'تنظیم شده' : 'خالی' }}</Tag>
              <FIcon name="chevronEnd" :size="18" class="chev" />
            </template>
          </Cell>
        </template>
      </Section>
      <Section><template #footer>رمزها و توکن‌ها فقط به‌صورت ماسک‌شده نمایش داده می‌شن و بعد از ذخیره دیگه قابل دیدن نیستن.</template></Section>
    </List>

    <Modal v-model:open="open">
      <template #header><ModalHeader>{{ editing?.title }}</ModalHeader></template>
      <div v-if="editing" class="sheet">
        <Input :value="value" class="ltr" :type="editing.secret ? 'password' : 'text'" :placeholder="editing.hint ?? 'مقدار جدید'" @input="value = ($event.target as HTMLInputElement).value" @keydown.enter="save()" />
        <p v-if="editing.hint" class="note">{{ editing.hint }}</p>
        <div class="pad cta"><Button stretched size="l" :loading="busy" @click="save()">ذخیره</Button></div>
        <div v-if="editing.isSet" class="pad"><Button stretched mode="bezeled" :disabled="busy" @click="save(true)">پاک کردن مقدار فعلی</Button></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.val { font-size: 12px; word-break: break-all; }
.chev { color: var(--tgui-hint-color); margin-inline-start: 6px; }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.note { padding: 6px 20px 0; font-size: 12px; color: var(--tgui-hint-color); }
.cta { margin-top: 12px; }
.pad + .pad { margin-top: 8px; }
</style>
