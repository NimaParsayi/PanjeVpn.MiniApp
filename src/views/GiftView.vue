<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { computed, ref } from 'vue'
import { Banner, Button, Cell, List, Modal, ModalHeader, Section } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import CopyCell from '@/components/CopyCell.vue'
import { api, ApiError, type Gift } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { confetti } from '@/utils/confetti'
import { haptic, shareLink } from '@/telegram/webapp'
import { fa, toman } from '@/utils/format'

const app = useApp()
const ui = useUi()
const raw = ref('')
const busy = ref(false)
const gift = ref<Gift | null>(null)
const open = computed({ get: () => !!gift.value, set: (v) => { if (!v) gift.value = null } })

const value = computed(() => Number(raw.value) || 0)
const enough = computed(() => value.value <= (app.me?.wallet ?? 0))
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', '000']
const quick = [100_000, 200_000, 500_000, 1_000_000]

function press(k: string) {
  haptic.select()
  if (k === 'back') raw.value = raw.value.slice(0, -1)
  else if ((raw.value + k).replace(/^0+/, '').length <= 9) raw.value = (raw.value + k).replace(/^0+/, '')
}

async function create() {
  if (value.value === 0) return ui.toast('نمیشه که مبلغ پنجه‌گیفت صفر باشه!', 'error')
  if (!enough.value) return ui.toast('موجودی کیف پولت کافی نیست :(', 'error')
  busy.value = true
  try {
    gift.value = await api.createGift(value.value)
    await app.refreshMe()
    raw.value = ''
    confetti()
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { busy.value = false }
}
</script>

<template>
  <div class="screen">
    <PageTitle title="پنجه‌گیفت" subtitle="شارژ هدیه برای دوستات" back />
    <List>
      <Banner type="section">
        <template #before><TgEmoji :id="E.gift" fallback="gift" :size="32" /></template>
        <template #header>هر هدیه یک‌بار مصرفه</template>
        <template #subheader>برای هر نفر جدا بساز. مبلغ همون لحظه از کیف پولت کم می‌شه.</template>
      </Banner>

      <Section>
        <div class="disp">
          <span class="muted">مبلغ هدیه</span>
          <div class="amt num" :class="{ zero: !value }">{{ fa(value) }}<small>تومان</small></div>
          <span class="muted num" :class="{ bad: !enough }">موجودی شما: {{ toman(app.me!.wallet) }}</span>
          <div class="quick">
            <Button v-for="q in quick" :key="q" mode="gray" size="s" @click="raw = String(q); haptic.select()">
              <span class="num">{{ q >= 1_000_000 ? `${fa(q / 1_000_000)} میلیون` : `${fa(q / 1000)} هزار` }}</span>
            </Button>
          </div>
        </div>
      </Section>

      <div class="pad pad-keys">
        <Button v-for="k in keys" :key="k" mode="gray" size="l" class="key" :aria-label="k === 'back' ? 'پاک کردن' : k" @click="press(k)">
          <FIcon v-if="k === 'back'" name="backspace" :size="22" />
          <span v-else class="num k">{{ fa(Number(k)).padStart(k.length, '۰') }}</span>
        </Button>
      </div>
    </List>

    <div class="action-bar">
      <Button stretched size="l" :disabled="!value || !enough" :loading="busy" @click="create"><template #before><FIcon name="gift" :size="20" /></template>ساخت پنجه‌گیفت</Button>
    </div>

    <Modal v-model:open="open">
      <template #header><ModalHeader>پنجه‌گیفت ساخته شد!</ModalHeader></template>
      <div v-if="gift" class="sheet">
        <Cell multiline>پنجه‌گیفت به مبلغ <b class="num">{{ toman(gift.amount) }}</b> آماده‌ست.
          <template #description>کافیه لینک رو کپی کنی و برای شخص مدنظرت بفرستی؛ با کلیک روی لینک، کیف پولش شارژ می‌شه.</template>
        </Cell>
        <CopyCell label="لینک پنجه‌گیفت" :value="gift.link" ltr />
        <div class="pad cta"><Button stretched size="l" @click="shareLink(gift.link, 'یه پنجه‌گیفت برات دارم 🎁')"><template #before><FIcon name="send" :size="18" /></template>ارسال برای دوستم</Button></div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.disp { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px; text-align: center; }
.amt { font-size: 40px; font-weight: 800; line-height: 1.4; display: flex; align-items: baseline; gap: 8px; }
.amt small { font-size: 14px; font-weight: 400; color: var(--tgui-hint-color); }
.amt.zero { color: var(--tgui-hint-color); }
.muted { color: var(--tgui-hint-color); font-size: 13px; }
.bad { color: var(--tgui-destructive-text-color); }
.quick { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 8px; }
.pad-keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; direction: ltr; }
.key { height: 54px; }
.k { font-size: 22px; font-weight: 600; }
.sheet { padding-bottom: calc(var(--safe-bottom) + 12px); }
.cta { margin-top: 12px; }
</style>
