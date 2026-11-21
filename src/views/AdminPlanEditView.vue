<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Banner, Button, Cell, Input, List, Modal, ModalHeader, Section } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import Field from '@/components/Field.vue'
import FIcon from '@/components/FIcon.vue'
import { api, ApiError, type AdminPlanInput, type PanelKind, type PlanColor } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { haptic } from '@/telegram/webapp'
import { asciiDigits } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const id = computed(() => (route.params.id === 'new' ? null : String(route.params.id)))

// Everything is edited as text (so Persian digits and half-typed numbers are fine) and parsed on save.
const name = ref('')
const description = ref('')
const emojiId = ref('')
const color = ref<PlanColor>('Primary')
const panel = ref<PanelKind>('pasarguard')
const inboundIds = ref('')
const price = ref('10000')
const days = ref('7,14,30,60,90')
const dayMultiplier = ref('1.5')
const minSize = ref('5')
const maxSize = ref('100')
const sizeMultiplication = ref('2')
const resellersOnly = ref(false)
const warning = ref<string | null>(null)

const busy = ref(false)
const confirmDelete = ref(false)
const loaded = ref(!id.value)

const ascii = (s: string) => asciiDigits(s).replace(/[٫]/g, '.').replace(/[،]/g, ',').trim()
const num = (s: string) => Number(ascii(s).replace(/,/g, ''))

onMounted(async () => {
  if (!id.value) return
  try {
    const p = (await api.getAdminPlans()).find((x) => x.id === id.value)
    if (!p) { ui.toast('این پلن پیدا نشد.', 'error'); router.replace('/admin/plans'); return }
    name.value = p.name; description.value = p.description; emojiId.value = p.emojiId ?? ''
    color.value = p.color; panel.value = p.panel; inboundIds.value = p.inboundIds.join(',')
    price.value = String(p.pricePerGb); days.value = p.days.join(','); dayMultiplier.value = String(p.dayMultiplier)
    minSize.value = String(p.minSize); maxSize.value = String(p.maxSize); sizeMultiplication.value = String(p.sizeMultiplication)
    resellersOnly.value = p.resellersOnly; warning.value = p.warning
    loaded.value = true
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  }
})

function build(): AdminPlanInput {
  return {
    name: name.value.trim(), description: description.value.trim(), emojiId: ascii(emojiId.value) || null,
    color: color.value, inboundIds: ascii(inboundIds.value).split(/[,\s]+/).filter(Boolean).map(Number), panel: panel.value, pricePerGb: num(price.value),
    days: ascii(days.value).split(/[,\s]+/).filter(Boolean).map(Number),
    dayMultiplier: num(dayMultiplier.value), minSize: num(minSize.value), maxSize: num(maxSize.value),
    sizeMultiplication: num(sizeMultiplication.value), resellersOnly: resellersOnly.value,
  }
}

async function save() {
  const input = build()
  const numbers = [...input.inboundIds, input.pricePerGb, input.dayMultiplier, input.minSize, input.maxSize, input.sizeMultiplication, ...input.days]
  if (numbers.some((n) => Number.isNaN(n))) { ui.toast('مقدارهای عددی رو با اعداد درست وارد کن.', 'error'); return }
  busy.value = true
  try {
    const saved = await api.saveAdminPlan(id.value, input)
    haptic.success()
    ui.toast(saved.warning ? `ذخیره شد، اما: ${saved.warning}` : 'پلن ذخیره شد', saved.warning ? 'error' : 'success', 2600)
    router.replace('/admin/plans')
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { busy.value = false }
}

async function remove() {
  if (!id.value) return
  busy.value = true
  try {
    await api.deleteAdminPlan(id.value)
    haptic.success(); ui.toast('پلن حذف شد', 'success')
    router.replace('/admin/plans')
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { busy.value = false; confirmDelete.value = false }
}

const colors: { v: PlanColor; label: string }[] = [
  { v: 'Primary', label: 'آبی' }, { v: 'Success', label: 'سبز' }, { v: 'Danger', label: 'قرمز' },
]
</script>

<template>
  <div class="screen">
    <PageTitle :title="id ? 'ویرایش پلن' : 'پلن جدید'" subtitle="مشخصات و قیمت‌گذاری" back />
    <List v-if="loaded">
      <Banner v-if="warning" type="section">
        <template #before><FIcon name="warning" :size="28" /></template>
        <template #header>پلن کامل نیست</template>
        <template #subheader>{{ warning }}</template>
      </Banner>

      <Section>
        <template #header>نمایش</template>
        <Field label="نام پلن"><Input :value="name" placeholder="مثلاً اقتصادی" @input="name = ($event.target as HTMLInputElement).value" /></Field>
        <Field label="توضیحات (HTML تلگرام مجازه)"><Input :value="description" placeholder="مثلاً مناسب وب‌گردی" @input="description = ($event.target as HTMLInputElement).value" /></Field>
        <Field label="آیدی ایموجی پرمیوم (اختیاری)"><Input :value="emojiId" class="ltr" inputmode="numeric" placeholder="خالی = پیش‌فرض" @input="emojiId = ($event.target as HTMLInputElement).value" /></Field>
        <div class="seg">
          <Button v-for="c in colors" :key="c.v" size="s" :mode="color === c.v ? 'filled' : 'gray'" @click="color = c.v; haptic.select()">{{ c.label }}</Button>
        </div>
        <template #footer>رنگ دکمه‌ی پلن در بات و مینی‌اپ.</template>
      </Section>

      <Section>
        <template #header>پنل</template>
        <div class="seg">
          <Button size="s" :mode="panel === 'pasarguard' ? 'filled' : 'gray'" @click="panel = 'pasarguard'; haptic.select()">پاسارگارد</Button>
          <Button size="s" :mode="panel === 'sanaei' ? 'filled' : 'gray'" @click="panel = 'sanaei'; haptic.select()">سنایی</Button>
        </div>
        <Field label="شناسه گروه / اینباند (یک یا چند تا، با ویرگول)"><Input :value="inboundIds" class="ltr" placeholder="مثلاً 1,3" @input="inboundIds = ($event.target as HTMLInputElement).value" /></Field>
        <template #footer>پاسارگارد: شماره‌ی group ها (مثلاً 1,3) · سنایی: شماره‌ی inbound ها. سرویس روی همه‌ی اینا ساخته می‌شه.</template>
      </Section>

      <Section>
        <template #header>قیمت و مدت</template>
        <Field label="قیمت هر گیگ (تومان)"><Input :value="price" inputmode="numeric" placeholder="مثلاً 10000" @input="price = ($event.target as HTMLInputElement).value" /></Field>
        <Field label="گزینه‌های مدت (روز، با ویرگول)"><Input :value="days" class="ltr" placeholder="7,14,30" @input="days = ($event.target as HTMLInputElement).value" /></Field>
        <Field label="ضریب قیمت هر پله مدت"><Input :value="dayMultiplier" class="ltr" inputmode="decimal" placeholder="1.5" @input="dayMultiplier = ($event.target as HTMLInputElement).value" /></Field>
        <template #footer>قیمت = قیمت هر گیگ × حجم × ضریب^پله‌ی مدت. برای پلن نامحدود، قیمت همون قیمت پلنه.</template>
      </Section>

      <Section>
        <template #header>حجم</template>
        <Field label="حداقل حجم (گیگ) — 0 یعنی نامحدود"><Input :value="minSize" class="ltr" inputmode="numeric" placeholder="5" @input="minSize = ($event.target as HTMLInputElement).value" /></Field>
        <Field label="حداکثر حجم (گیگ) — -1 یعنی بدون سقف"><Input :value="maxSize" class="ltr" inputmode="numeric" placeholder="100" @input="maxSize = ($event.target as HTMLInputElement).value" /></Field>
        <Field label="ضریب پله حجم — -1 یعنی یکی‌یکی"><Input :value="sizeMultiplication" class="ltr" inputmode="decimal" placeholder="2" @input="sizeMultiplication = ($event.target as HTMLInputElement).value" /></Field>
      </Section>

      <Section>
        <template #header>دسترسی</template>
        <Cell @click="resellersOnly = !resellersOnly; haptic.select()">
          <template #after><b>{{ resellersOnly ? 'فقط نمایندگان' : 'همه کاربران' }}</b></template>
          این پلن برای چه کسانی نمایش داده بشه؟
        </Cell>
      </Section>

      <div class="pad-btn"><Button v-if="id" stretched mode="bezeled" @click="confirmDelete = true">حذف پلن</Button></div>
    </List>

    <div class="action-bar">
      <Button stretched size="l" :loading="busy" @click="save"><template #before><FIcon name="check" :size="20" /></template>ذخیره</Button>
    </div>

    <Modal v-model:open="confirmDelete">
      <template #header><ModalHeader>حذف پلن؟</ModalHeader></template>
      <div class="sheet">
        <p class="note">پلن از فروش خارج می‌شه ولی سرویس‌هایی که قبلاً خریده شدن سر جاشون می‌مونن.</p>
        <div class="pad"><Button stretched size="l" :loading="busy" @click="remove">بله، حذف کن</Button></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.seg { display: flex; gap: 8px; padding: 8px 16px 12px; }
.pad-btn { margin-bottom: var(--block-gap); }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.note { padding: 4px 20px 12px; color: var(--tgui-hint-color); line-height: 1.7; }
</style>
