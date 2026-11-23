<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Cell, Divider, Input, List, Modal, ModalHeader, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import Field from '@/components/Field.vue'
import FIcon from '@/components/FIcon.vue'
import Tag from '@/components/Tag.vue'
import { api, ApiError, type AdminUser, type ResellerInfo } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { haptic } from '@/telegram/webapp'
import { asciiDigits, fa, toman } from '@/utils/format'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const resellers = ref<ResellerInfo[] | null>(null)
const query = ref('')
const results = ref<AdminUser[]>([])
const searching = ref(false)
const searched = ref(false)
const busy = ref<number | null>(null)

const modalOpen = ref(false)
const target = ref<{ telegramId: number; username: string | null; isEdit: boolean } | null>(null)
const titleInput = ref('')
const saving = ref(false)

const TITLE_RE = /^[A-Za-z0-9_]{2,20}$/
const label = (u: { username: string | null; telegramId: number }) => (u.username ? `@${u.username}` : String(u.telegramId))
const err = (e: unknown) => ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
// Pasted text often drags invisible direction marks along; strip them.
const clean = (s: string) => asciiDigits(s.replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff\u00a0]/g, '')).trim()
const resellerById = computed(() => new Map((resellers.value ?? []).map((r) => [r.telegramId, r])))
const trimmedTitle = computed(() => titleInput.value.trim())
const titleValid = computed(() => TITLE_RE.test(trimmedTitle.value))

onMounted(async () => { try { resellers.value = await api.getResellers() } catch (e) { err(e) } })

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

function openAdd(u: AdminUser) {
  const existing = resellerById.value.get(u.telegramId)
  target.value = { telegramId: u.telegramId, username: u.username, isEdit: !!existing }
  titleInput.value = existing?.title ?? (u.username && TITLE_RE.test(u.username) ? u.username : '')
  modalOpen.value = true
  haptic.select()
}

function openEdit(r: ResellerInfo) {
  target.value = { telegramId: r.telegramId, username: r.username, isEdit: true }
  titleInput.value = r.title
  modalOpen.value = true
  haptic.select()
}

async function save() {
  if (!target.value || !titleValid.value) return
  saving.value = true
  try {
    const wasEdit = target.value.isEdit
    const name = label(target.value)
    resellers.value = await api.saveReseller(target.value.telegramId, trimmedTitle.value)
    modalOpen.value = false
    query.value = ''; results.value = []; searched.value = false
    haptic.success()
    ui.toast(wasEdit ? `پیشوند ${name} به ${trimmedTitle.value} تغییر کرد` : `${name} نماینده شد`, 'success')
  } catch (e) { err(e) } finally { saving.value = false }
}

async function remove(r: ResellerInfo) {
  busy.value = r.telegramId
  try {
    resellers.value = await api.removeReseller(r.telegramId)
    haptic.success()
    ui.toast('دسترسی نمایندگی برداشته شد', 'success')
  } catch (e) { err(e) } finally { busy.value = null }
}
</script>

<template>
  <div class="screen">
    <PageTitle title="مدیریت نمایندگان" subtitle="تعریف نماینده و پیشوند کانفیگ‌ها" back />
    <List>
      <Section>
        <template #header>افزودن نماینده</template>
        <Input
          :value="query" class="ltr" type="search" inputmode="text" dir="ltr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
          placeholder="شناسه عددی یا @یوزرنیم" @input="onInput(($event.target as HTMLInputElement).value)"
        />
        <template #footer>کاربر باید قبلاً ربات رو استارت کرده باشه. روی نتیجه بزن تا پیشوندش رو مشخص کنی.</template>
      </Section>

      <Section v-if="searching || results.length || searched">
        <template v-if="results.length">
          <template v-for="(u, i) in results" :key="u.telegramId">
            <Divider v-if="i" />
            <Cell @click="openAdd(u)">
              <template #before><FIcon name="user" :size="20" /></template>
              <span class="ltr">{{ label(u) }}</span>
              <template #subtitle><span class="ltr">{{ u.telegramId }}</span></template>
              <template #after>
                <Tag v-if="resellerById.has(u.telegramId)" tone="success">{{ resellerById.get(u.telegramId)!.title }}</Tag>
                <Button v-else size="s" @click.stop="openAdd(u)">انتخاب</Button>
              </template>
            </Cell>
          </template>
        </template>
        <Cell v-else-if="searching">در حال جست‌وجو…</Cell>
        <Cell v-else>کاربری با این مشخصات پیدا نشد.</Cell>
      </Section>

      <Section v-if="!resellers"><Skeleton visible><div style="height: 140px" /></Skeleton></Section>
      <Section v-else>
        <template #header>نمایندگان فعلی</template>
        <Cell v-if="!resellers.length">هنوز نماینده‌ای تعریف نشده.</Cell>
        <template v-for="(r, i) in resellers" :key="r.telegramId">
          <Divider v-if="i" />
          <Cell>
            <template #before><FIcon name="people" :size="20" /></template>
            <div class="row-title">
              <Tag tone="info"><span class="ltr">{{ r.title }}</span></Tag>
              <span class="ltr">{{ label(r) }}</span>
            </div>
            <template #subtitle>
              <span class="ltr">{{ r.telegramId }}</span> · {{ fa(r.services) }} سرویس · <span class="num">{{ toman(r.wallet) }}</span>
            </template>
            <template #after>
              <div class="actions">
                <Button size="s" mode="gray" @click="openEdit(r)">ویرایش</Button>
                <Button size="s" mode="bezeled" :loading="busy === r.telegramId" @click="remove(r)">حذف</Button>
              </div>
            </template>
          </Cell>
        </template>
        <template #footer>پیشوند نماینده اول نام کانفیگ‌هاش قرار می‌گیره و فقط پلن‌های نمایندگی بهش نمایش داده می‌شه.</template>
      </Section>
    </List>

    <Modal v-model:open="modalOpen">
      <template #header><ModalHeader>{{ target?.isEdit ? 'ویرایش پیشوند نماینده' : 'تعریف نماینده' }}</ModalHeader></template>
      <div v-if="target" class="sheet">
        <Cell><template #after><span class="ltr">{{ label(target) }}</span></template>کاربر</Cell>
        <Cell><template #after><span class="ltr">{{ target.telegramId }}</span></template>شناسه تلگرام</Cell>
        <Field label="پیشوند انگلیسی">
          <Input
            :value="titleInput" class="ltr" dir="ltr" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
            placeholder="مثلاً Nima" @input="titleInput = clean(($event.target as HTMLInputElement).value)"
            @keydown.enter="save"
          />
        </Field>
        <p class="hint-line">
          <template v-if="titleValid">نمونه نام کانفیگ: <b class="ltr">{{ trimmedTitle }}-config</b></template>
          <template v-else>۲ تا ۲۰ کاراکتر انگلیسی، عدد یا _ (بدون فاصله).</template>
        </p>
        <div class="pad cta">
          <Button stretched size="l" :disabled="!titleValid" :loading="saving" @click="save">
            {{ target.isEdit ? 'ذخیره پیشوند' : 'افزودن نماینده' }}
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.row-title { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.actions { display: flex; align-items: center; gap: 6px; }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.hint-line { margin: 4px 16px 0; font-size: 12px; color: var(--tgui-hint-color); }
.cta { margin-top: 12px; }
</style>
