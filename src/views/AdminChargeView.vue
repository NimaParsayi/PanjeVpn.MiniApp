<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Banner, Button, Cell, Divider, Input, List, Modal, ModalHeader, Section } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import Tag from '@/components/Tag.vue'
import TgEmoji from '@/components/TgEmoji.vue'
import { api, ApiError, type AdminUser } from '@/api'
import { E } from '@/emoji/ids'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { confetti } from '@/utils/confetti'
import { asciiDigits, compactToman, fa, faDigits, toman } from '@/utils/format'
import { haptic } from '@/telegram/webapp'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const query = ref('')
const amountText = ref('')
const user = ref<AdminUser | null>(null)
const results = ref<AdminUser[]>([])
const searching = ref(false)
const searched = ref(false)
const confirming = ref(false)
const busy = ref(false)
const done = ref<{ name: string; added: number; wallet: number } | null>(null)

const amount = computed(() => Number(asciiDigits(amountText.value).replace(/\D/g, '')) || 0)
const quick = [100_000, 200_000, 500_000, 1_000_000]
const label = (u: AdminUser) => (u.username ? `@${u.username}` : String(u.telegramId))

// Pasted text often drags invisible direction marks / zero-width characters along (Telegram does this a lot),
// which made the lookup fail or show stray text. Strip them, then normalise digits.
const clean = (s: string) => asciiDigits(s.replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u2069\ufeff\u00a0]/g, '')).trim()

let timer: ReturnType<typeof setTimeout> | undefined
let seq = 0

async function search() {
  const q = clean(query.value)
  const mine = ++seq
  if (!q) { results.value = []; searched.value = false; searching.value = false; return }
  searching.value = true
  try {
    const r = await api.searchUsers(q)
    if (mine !== seq) return // a newer keystroke superseded this one
    results.value = r; searched.value = true
  } catch (e) {
    if (mine === seq) ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { if (mine === seq) searching.value = false }
}

function onInput(raw: string) {
  query.value = clean(raw)
  user.value = null; done.value = null
  searching.value = !!query.value
  clearTimeout(timer)
  timer = setTimeout(search, 250)
}

function pick(u: AdminUser) {
  user.value = u; done.value = null; results.value = []; query.value = label(u); searched.value = false
  haptic.select()
}

onBeforeUnmount(() => clearTimeout(timer))

async function charge() {
  if (!user.value) return
  busy.value = true
  try {
    const u = await api.adminCharge({ telegramId: user.value.telegramId, amount: amount.value })
    done.value = { name: label(u), added: amount.value, wallet: u.wallet }
    user.value = u; amountText.value = ''; confirming.value = false
    haptic.success(); confetti()
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { busy.value = false }
}
</script>

<template>
  <div class="screen">
    <PageTitle title="شارژ حساب مشتری" subtitle="افزایش موجودی کیف پول" back />
    <List>
      <Section>
        <template #header>کاربر</template>
        <Input
          :value="query" class="ltr" type="search" inputmode="text" dir="ltr" autocomplete="off" autocapitalize="off"
          autocorrect="off" spellcheck="false" enterkeyhint="search"
          placeholder="جست‌وجو با شناسه عددی یا @یوزرنیم"
          @input="onInput(($event.target as HTMLInputElement).value)"
          @keydown.enter="results[0] && pick(results[0])"
        />
        <template #footer>همین‌طور که تایپ یا پیست می‌کنی نتایج میاد. کاربر باید قبلاً ربات رو استارت کرده باشه.</template>
      </Section>

      <Section v-if="!user && (searching || results.length || searched)">
        <template v-if="results.length">
          <template v-for="(u, i) in results" :key="u.telegramId">
            <Divider v-if="i" />
            <Cell @click="pick(u)">
              <template #before><FIcon name="user" :size="20" /></template>
              <span class="ltr">{{ u.username ? '@' + u.username : u.telegramId }}</span>
              <template #subtitle><span class="ltr">{{ u.telegramId }}</span></template>
              <template #after><span class="num hint">{{ toman(u.wallet) }}</span></template>
            </Cell>
          </template>
        </template>
        <Cell v-else-if="searching"><template #before><FIcon name="refresh" :size="20" /></template>در حال جست‌وجو…</Cell>
        <Cell v-else><template #before><FIcon name="info" :size="20" /></template>کاربری با این مشخصات پیدا نشد.</Cell>
      </Section>

      <template v-if="user">
        <Section>
          <template #header>مشخصات</template>
          <Cell><template #after><span class="ltr">{{ user.telegramId }}</span></template>شناسه تلگرام</Cell>
          <Cell v-if="user.username"><template #after><span class="ltr">@{{ user.username }}</span></template>یوزرنیم</Cell>
          <Cell><template #after><b class="num">{{ toman(user.wallet) }}</b></template>موجودی فعلی</Cell>
          <Cell><template #after><Tag tone="neutral">{{ fa(user.services) }} سرویس</Tag></template>سرویس‌ها</Cell>
        </Section>

        <Section>
          <template #header>مبلغ شارژ (تومان)</template>
          <Input :value="amountText" inputmode="numeric" placeholder="مثلاً ۵۰۰۰۰۰" @input="amountText = faDigits(asciiDigits(($event.target as HTMLInputElement).value).replace(/\D/g, ''))" />
          <div class="quick">
            <Button v-for="q in quick" :key="q" mode="gray" size="s" @click="amountText = faDigits(String(q)); haptic.select()"><span class="num">{{ compactToman(q) }}</span></Button>
          </div>
          <template #footer><span v-if="amount" class="num">{{ toman(amount) }}</span><span v-else>مبلغ رو بنویس.</span></template>
        </Section>

        <Banner v-if="done" type="section">
          <template #before><TgEmoji :id="E.paid" fallback="checkCircle" :size="32" /></template>
          <template #header>{{ toman(done.added) }} شارژ شد</template>
          <template #subheader>موجودی جدید {{ done.name }}: <b class="num">{{ toman(done.wallet) }}</b>. پیام اطلاع‌رسانی برای کاربر هم ارسال شد.</template>
        </Banner>
      </template>
    </List>

    <div v-if="user" class="action-bar">
      <Button stretched size="l" :disabled="amount <= 0" @click="confirming = true"><template #before><FIcon name="plus" :size="20" /></template>شارژ {{ amount ? toman(amount) : '' }}</Button>
    </div>

    <Modal v-model:open="confirming">
      <template #header><ModalHeader>تایید شارژ</ModalHeader></template>
      <div v-if="user" class="sheet">
        <Cell><template #after><span class="ltr">{{ label(user) }}</span></template>کاربر</Cell>
        <Cell><template #after><span class="num">{{ toman(user.wallet) }}</span></template>موجودی فعلی</Cell>
        <Cell><template #after><b class="num">{{ toman(amount) }}</b></template>مبلغ شارژ</Cell>
        <Cell><template #after><b class="num total">{{ toman(user.wallet + amount) }}</b></template>موجودی بعد از شارژ</Cell>
        <div class="pad cta"><Button stretched size="l" :loading="busy" @click="charge">تایید و شارژ</Button></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.hint { font-size: 12px; color: var(--tgui-hint-color); white-space: nowrap; }
.quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 16px 12px; }
.total { color: var(--tgui-link-color); }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.cta { margin-top: 12px; }
</style>
