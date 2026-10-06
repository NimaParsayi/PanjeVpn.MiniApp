<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Banner, Button, Cell, Input, List, Modal, ModalHeader, Section } from 'telegram-ui-vue'
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
const looking = ref(false)
const confirming = ref(false)
const busy = ref(false)
const done = ref<{ name: string; added: number; wallet: number } | null>(null)

const amount = computed(() => Number(asciiDigits(amountText.value).replace(/\D/g, '')) || 0)
const quick = [100_000, 200_000, 500_000, 1_000_000]
const label = (u: AdminUser) => (u.username ? `@${u.username}` : String(u.telegramId))

async function lookup() {
  if (!query.value.trim()) return
  looking.value = true; done.value = null
  try { user.value = await api.lookupUser(asciiDigits(query.value.trim())) }
  catch (e) { user.value = null; ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error') }
  finally { looking.value = false }
}

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
        <Input :value="query" class="ltr" inputmode="text" placeholder="شناسه عددی یا @یوزرنیم" @input="query = ($event.target as HTMLInputElement).value" @keydown.enter="lookup" />
        <template #footer>کاربر باید قبلاً ربات رو استارت کرده باشه.</template>
      </Section>
      <div class="pad-btn"><Button stretched mode="bezeled" :loading="looking" :disabled="!query.trim()" @click="lookup"><template #before><FIcon name="user" :size="18" /></template>پیدا کردن کاربر</Button></div>

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
.pad-btn { margin: -8px 0 var(--block-gap); }
.quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 16px 12px; }
.total { color: var(--tgui-link-color); }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.cta { margin-top: 12px; }
</style>
