<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Cell, Divider, Input, List, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import Tag from '@/components/Tag.vue'
import { api, ApiError, type AdminInfo, type AdminUser } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { haptic } from '@/telegram/webapp'
import { asciiDigits } from '@/utils/format'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const admins = ref<AdminInfo[] | null>(null)
const query = ref('')
const results = ref<AdminUser[]>([])
const searching = ref(false)
const searched = ref(false)
const busy = ref<number | null>(null)

const label = (u: { username: string | null; telegramId: number }) => (u.username ? `@${u.username}` : String(u.telegramId))
const err = (e: unknown) => ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
// Pasted text often drags invisible direction marks along; strip them.
const clean = (s: string) => asciiDigits(s.replace(/[​-‏‪-‮⁠-⁩﻿ ]/g, '')).trim()
const isAdminId = computed(() => new Set((admins.value ?? []).map((a) => a.telegramId)))

onMounted(async () => { try { admins.value = await api.getAdmins() } catch (e) { err(e) } })

let timer: ReturnType<typeof setTimeout> | undefined
let seq = 0
onBeforeUnmount(() => clearTimeout(timer))

async function search() {
  const q = clean(query.value)
  const mine = ++seq
  if (!q) { results.value = []; searched.value = false; searching.value = false; return }
  searching.value = true
  try {
    const r = await api.searchUsers(q)
    if (mine !== seq) return
    results.value = r; searched.value = true
  } catch (e) { if (mine === seq) err(e) } finally { if (mine === seq) searching.value = false }
}

function onInput(raw: string) {
  query.value = clean(raw)
  searching.value = !!query.value
  clearTimeout(timer)
  timer = setTimeout(search, 250)
}

async function add(u: AdminUser) {
  busy.value = u.telegramId
  try {
    admins.value = await api.addAdmin(u.telegramId)
    haptic.success(); ui.toast(`${label(u)} ادمین شد`, 'success')
    query.value = ''; results.value = []; searched.value = false
  } catch (e) { err(e) } finally { busy.value = null }
}

async function remove(a: AdminInfo) {
  busy.value = a.telegramId
  try { admins.value = await api.removeAdmin(a.telegramId); haptic.success(); ui.toast('دسترسی ادمین برداشته شد', 'success') }
  catch (e) { err(e) } finally { busy.value = null }
}
</script>

<template>
  <div class="screen">
    <PageTitle title="مدیریت ادمین‌ها" subtitle="چه کسانی به پنل دسترسی دارن" back />
    <List>
      <Section>
        <template #header>افزودن ادمین</template>
        <Input
          :value="query" class="ltr" type="search" inputmode="text" dir="ltr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
          placeholder="شناسه عددی یا @یوزرنیم" @input="onInput(($event.target as HTMLInputElement).value)"
        />
        <template #footer>کاربر باید قبلاً ربات رو استارت کرده باشه. روی نتیجه بزن تا ادمین بشه.</template>
      </Section>

      <Section v-if="searching || results.length || searched">
        <template v-if="results.length">
          <template v-for="(u, i) in results" :key="u.telegramId">
            <Divider v-if="i" />
            <Cell>
              <template #before><FIcon name="user" :size="20" /></template>
              <span class="ltr">{{ label(u) }}</span>
              <template #subtitle><span class="ltr">{{ u.telegramId }}</span></template>
              <template #after>
                <Tag v-if="isAdminId.has(u.telegramId)" tone="success">ادمینه</Tag>
                <Button v-else size="s" :loading="busy === u.telegramId" @click="add(u)">افزودن</Button>
              </template>
            </Cell>
          </template>
        </template>
        <Cell v-else-if="searching">در حال جست‌وجو…</Cell>
        <Cell v-else>کاربری با این مشخصات پیدا نشد.</Cell>
      </Section>

      <Section v-if="!admins"><Skeleton visible><div style="height: 140px" /></Skeleton></Section>
      <Section v-else>
        <template #header>ادمین‌های فعلی</template>
        <template v-for="(a, i) in admins" :key="a.telegramId">
          <Divider v-if="i" />
          <Cell>
            <template #before><FIcon name="shieldCheck" :size="20" /></template>
            <span class="ltr">{{ label(a) }}</span>
            <template #subtitle><span class="ltr">{{ a.telegramId }}</span></template>
            <template #after>
              <Tag v-if="a.isOwner" tone="info">اصلی</Tag>
              <Tag v-else-if="a.isMe" tone="neutral">شما</Tag>
              <Button v-else size="s" mode="bezeled" :loading="busy === a.telegramId" @click="remove(a)">حذف</Button>
            </template>
          </Cell>
        </template>
        <template #footer>ادمین‌های «اصلی» در تنظیمات سرور تعریف شدن و از اینجا حذف نمی‌شن.</template>
      </Section>
    </List>
  </div>
</template>
