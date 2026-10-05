<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FButton from '@/components/FButton.vue'
import FIcon from '@/components/FIcon.vue'
import FSheet from '@/components/FSheet.vue'
import FMessageBar from '@/components/FMessageBar.vue'
import CopyRow from '@/components/CopyRow.vue'
import { api, ApiError, type Gift } from '@/api'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { haptic, shareLink } from '@/telegram/webapp'
import { confetti } from '@/utils/confetti'
import { fa, toman } from '@/utils/format'

const app = useApp()
const ui = useUi()
const raw = ref('')
const busy = ref(false)
const gift = ref<Gift | null>(null)

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
  <div class="view">
    <PageHeader title="پنجه‌گیفت" subtitle="شارژ هدیه برای دوستات" back="/" />
    <main class="page no-nav">
      <FMessageBar intent="info">
        هر پنجه‌گیفت یک‌بار مصرفه؛ برای هر نفر جدا بساز. مبلغ همون لحظه از کیف پولت کم می‌شه.
      </FMessageBar>

      <FCard padding="lg" class="disp">
        <span class="muted">مبلغ هدیه</span>
        <div class="amt num" :class="{ zero: !value }">{{ fa(value) }}<small>تومان</small></div>
        <div class="muted cap num" :class="{ bad: !enough }">موجودی شما: {{ toman(app.me!.wallet) }}</div>
        <div class="quick">
          <button v-for="q in quick" :key="q" type="button" class="q num" @click="raw = String(q); haptic.select()">{{ q >= 1_000_000 ? `${fa(q / 1_000_000)} میلیون` : `${fa(q / 1000)} هزار` }}</button>
        </div>
      </FCard>

      <div class="pad">
        <button v-for="k in keys" :key="k" type="button" class="key num" :class="{ fn: k === 'back' }" :aria-label="k === 'back' ? 'پاک کردن' : k" @click="press(k)">
          <FIcon v-if="k === 'back'" name="backspace" :size="22" />
          <template v-else>{{ fa(Number(k)).padStart(k.length, '۰') }}</template>
        </button>
      </div>

      <div class="sticky-cta">
        <FButton appearance="primary" size="lg" block icon="gift" :loading="busy" :disabled="!value || !enough" @click="create">ساخت پنجه‌گیفت</FButton>
      </div>
    </main>

    <FSheet :open="!!gift" title="پنجه‌گیفت ساخته شد!" @close="gift = null">
      <div v-if="gift" class="made">
        <span class="g"><FIcon name="gift" :size="30" /></span>
        <p>پنجه‌گیفت به مبلغ <b class="num">{{ toman(gift.amount) }}</b> آماده‌ست.</p>
        <p class="muted cap">کافیه لینک رو کپی کنی و برای شخص مدنظرت بفرستی؛ با کلیک روی لینک، کیف پولش شارژ می‌شه. همینقدر آسون!</p>
        <CopyRow label="لینک پنجه‌گیفت" :value="gift.link" ltr />
      </div>
      <template #footer>
        <FButton appearance="primary" block icon="send" @click="gift && shareLink(gift.link, 'یه پنجه‌گیفت برات دارم 🎁')">ارسال برای دوستم</FButton>
      </template>
    </FSheet>
  </div>
</template>

<style scoped>
.disp { text-align: center; display: flex; flex-direction: column; gap: var(--s-xs); }
.amt { font: var(--t-hero); font-size: 40px; line-height: 56px; display: flex; justify-content: center; align-items: baseline; gap: var(--s-s); }
.amt small { font: var(--t-body); color: var(--fg-3); }
.amt.zero { color: var(--fg-4); }
.cap { font: var(--t-caption); } .bad { color: var(--danger-fg); }
.quick { display: flex; justify-content: center; flex-wrap: wrap; gap: var(--s-s); margin-top: var(--s-s); }
.q { height: 28px; padding: 0 var(--s-m); border-radius: var(--r-full); border: 1px solid var(--stroke-2); background: var(--bg-1); font: var(--t-caption); font-weight: 600; cursor: pointer; }
.q:hover { background: var(--bg-subtle-hover); }
.pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--s-s); direction: ltr; }
.key { height: 56px; border: 1px solid var(--stroke-2); border-radius: var(--r-lg); background: var(--card-bg); font: var(--t-title3); font-size: 22px; cursor: pointer; display: grid; place-items: center; transition: background var(--dur-fast), transform var(--dur-fast); backdrop-filter: blur(20px); }
.key:hover { background: var(--bg-subtle-hover); }
.key:active { background: var(--bg-subtle-pressed); transform: scale(0.97); }
.key.fn { color: var(--danger-fg); }
.made { display: flex; flex-direction: column; gap: var(--s-m); align-items: stretch; text-align: center; }
.made .g { align-self: center; width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; background: var(--danger-bg); color: var(--danger-fg); }
</style>
