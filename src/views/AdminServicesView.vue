<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Cell, Divider, Input, List, Placeholder, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import TgEmoji from '@/components/TgEmoji.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { api, ApiError, type AdminService } from '@/api'
import { E } from '@/emoji/ids'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { copyText, haptic } from '@/telegram/webapp'
import { asciiDigits, date, fa, toman } from '@/utils/format'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const q = ref('')
const items = ref<AdminService[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let seq = 0

async function load(reset: boolean) {
  const mine = ++seq
  if (reset) { page.value = 1 }
  loading.value = true
  try {
    const r = await api.getAdminServices(page.value, asciiDigits(q.value.trim()))
    if (mine !== seq) return // a newer search superseded this one
    items.value = reset ? r.items : [...items.value, ...r.items]
    total.value = r.total
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { if (mine === seq) loading.value = false }
}
async function more() { page.value++; await load(false) }
async function copy(name: string) { haptic.tap(); ui.toast((await copyText(name)) ? 'نام سرویس کپی شد' : 'کپی انجام نشد', 'success', 1400) }

watch(q, () => { clearTimeout(timer); timer = setTimeout(() => load(true), 350) })
onMounted(() => load(true))
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="screen">
    <PageTitle title="سرویس‌های پنجه" :subtitle="total ? `${fa(total)} سرویس` : undefined" back />
    <List>
      <Section>
        <Input :value="q" class="ltr" placeholder="جست‌وجو: نام سرویس، شناسه یا @یوزرنیم" @input="q = ($event.target as HTMLInputElement).value" />
      </Section>

      <Section v-if="items.length">
        <template #footer>با زدن روی هر سرویس، نامش کپی می‌شه.</template>
        <template v-for="(s, i) in items" :key="s.id">
          <Divider v-if="i" />
          <Cell multiline @click="copy(s.name)">
            <template #before><ToneIcon :icon="s.icon" :tone="s.tone" :size="44" :emoji="s.emojiId" /></template>
            <span class="ltr name">{{ s.name }}</span>
            <template #subtitle>{{ s.planName }}</template>
            <template #description>
              <span class="owner"><span class="ltr">{{ s.ownerUsername ? '@' + s.ownerUsername : s.ownerTelegramId }}</span><span class="num">{{ date(s.createdAt) }}</span></span>
            </template>
            <template #after><span class="num price">{{ toman(s.priceAtTime) }}</span></template>
          </Cell>
        </template>
      </Section>
      <Section v-else-if="loading"><Skeleton visible><div style="height: 200px" /></Skeleton></Section>
      <Placeholder v-else>
        <TgEmoji :id="E.panda" fallback="shieldCheck" :size="110" loop />
        <template #header>سرویسی پیدا نشد</template>
        <template #description>عبارت دیگه‌ای رو جست‌وجو کن.</template>
      </Placeholder>

      <div v-if="items.length < total" class="more"><Button stretched mode="bezeled" :loading="loading" @click="more">نمایش بیشتر ({{ fa(total - items.length) }} مورد دیگه)</Button></div>
    </List>
  </div>
</template>

<style scoped>
.name { display: inline-block; font-size: 14px; font-weight: 600; }
.owner { display: flex; justify-content: space-between; gap: 12px; }
.price { font-size: 12px; color: var(--tgui-hint-color); white-space: nowrap; }
.more { margin-bottom: var(--block-gap); }
</style>
