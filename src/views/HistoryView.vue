<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Button, Cell, Divider, List, Placeholder, Section, SegmentedControl, SegmentedControlItem, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import Tag from '@/components/Tag.vue'
import TgEmoji from '@/components/TgEmoji.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { api, ApiError, type HistoryEntry, type HistoryKind } from '@/api'
import { E } from '@/emoji/ids'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { haptic } from '@/telegram/webapp'
import { dayLabel, fa, timeOfDay, toman } from '@/utils/format'

const app = useApp()
const ui = useUi()

type Filter = 'all' | 'in' | 'out'
const filters: { v: Filter; label: string }[] = [{ v: 'all', label: 'همه' }, { v: 'in', label: 'واریز' }, { v: 'out', label: 'برداشت' }]
const filter = ref<Filter>('all')
const items = ref<HistoryEntry[]>([])
const total = ref(0)
const totalIn = ref(0)
const totalOut = ref(0)
const page = ref(1)
const loading = ref(false)
const loaded = ref(false)

const META: Record<HistoryKind, { title: string; emoji: string; icon: string; tone: 'success' | 'primary' | 'danger' | 'neutral' }> = {
  deposit_ton: { title: 'شارژ با TON', emoji: E.ton, icon: 'ton', tone: 'primary' },
  deposit_stars: { title: 'شارژ با استارز', emoji: E.stars, icon: 'star', tone: 'success' },
  admin_charge: { title: 'شارژ توسط پشتیبانی', emoji: E.walletTopUp, icon: 'wallet', tone: 'success' },
  deposit: { title: 'شارژ کیف پول', emoji: E.coin, icon: 'coin', tone: 'success' },
  purchase: { title: 'خرید سرویس', emoji: E.buy, icon: 'cart', tone: 'primary' },
  extend: { title: 'تمدید سرویس', emoji: E.extend, icon: 'refresh', tone: 'primary' },
  gift_sent: { title: 'ارسال پنجه‌گیفت', emoji: E.gift, icon: 'gift', tone: 'danger' },
  gift_received: { title: 'دریافت پنجه‌گیفت', emoji: E.gift, icon: 'gift', tone: 'success' },
  trial: { title: 'دریافت سرویس تست', emoji: E.rocket, icon: 'sparkle', tone: 'success' },
  other: { title: 'تراکنش', emoji: E.coin, icon: 'coin', tone: 'neutral' },
}

// Entries arrive newest first; group them under a day heading.
const groups = computed(() => {
  const out: { key: string; label: string; rows: HistoryEntry[] }[] = []
  for (const e of items.value) {
    const label = dayLabel(e.at)
    const last = out[out.length - 1]
    if (last && last.label === label) last.rows.push(e)
    else out.push({ key: `${label}-${e.id}`, label, rows: [e] })
  }
  return out
})
const hasEstimates = computed(() => items.value.some((e) => e.estimated))

async function load(reset: boolean) {
  loading.value = true
  if (reset) page.value = 1
  try {
    const r = await api.getHistory(filter.value, page.value)
    items.value = reset ? r.items : [...items.value, ...r.items]
    total.value = r.total; totalIn.value = r.totalIn; totalOut.value = r.totalOut
  } catch (e) {
    ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error')
  } finally { loading.value = false; loaded.value = true }
}
async function more() { page.value++; await load(false) }
function pick(v: Filter) { haptic.select(); filter.value = v }

watch(filter, () => load(true))
// The wallet can change outside this app (the bot, an admin), so read the balance fresh along with the history.
onMounted(() => { load(true); void app.refreshMe().catch(() => {}) })
</script>

<template>
  <div class="screen">
    <PageTitle title="تاریخچه تراکنش‌ها" subtitle="گردش کیف پول تو" back />

    <div class="pad summary-wrap">
      <div class="summary glass-card">
        <div class="cell-sum">
          <span class="lbl">واریز</span>
          <b class="sum num in">+{{ fa(totalIn) }}</b>
        </div>
        <div class="vr" />
        <div class="cell-sum">
          <span class="lbl">برداشت</span>
          <b class="sum num out">−{{ fa(totalOut) }}</b>
        </div>
        <div class="vr" />
        <div class="cell-sum">
          <span class="lbl">موجودی فعلی</span>
          <b class="num">{{ fa(app.me?.wallet ?? 0) }}</b>
        </div>
      </div>
      <span class="unit">مبالغ به تومان</span>
    </div>

    <div class="pad seg">
      <SegmentedControl>
        <SegmentedControlItem v-for="f in filters" :key="f.v" :selected="filter === f.v" @click="pick(f.v)">{{ f.label }}</SegmentedControlItem>
      </SegmentedControl>
    </div>

    <List>
      <template v-if="groups.length">
        <Section v-for="(g, gi) in groups" :key="g.key">
          <template #header>{{ g.label }}</template>
          <template v-for="(e, i) in g.rows" :key="e.id">
            <Divider v-if="i" />
            <Cell>
              <template #before><ToneIcon :icon="META[e.kind].icon" :tone="e.amount > 0 ? 'success' : META[e.kind].tone" :size="44" :emoji="META[e.kind].emoji" /></template>
              {{ META[e.kind].title }}
              <template #subtitle>
                <span v-if="e.subject" class="ltr subj">{{ e.subject }}</span>
                <Tag v-else-if="e.status === 'pending'" tone="warning" dot>در انتظار پرداخت</Tag>
                <Tag v-else-if="e.estimated" tone="neutral">تقریبی</Tag>
              </template>
              <template v-if="(e.subject && (e.status === 'pending' || e.estimated))" #description>
                <Tag v-if="e.status === 'pending'" tone="warning" dot>در انتظار پرداخت</Tag>
                <Tag v-if="e.estimated" tone="neutral">تقریبی</Tag>
              </template>
              <template #after>
                <span class="amt">
                  <Tag v-if="e.amount === 0" tone="success">رایگان</Tag>
                  <b v-else class="sum num" :class="e.status === 'pending' ? 'wait' : e.amount > 0 ? 'in' : 'out'">{{ e.amount > 0 ? '+' : '−' }}{{ fa(Math.abs(e.amount)) }}</b>
                  <span class="time num">{{ timeOfDay(e.at) }}</span>
                </span>
              </template>
            </Cell>
          </template>
          <template v-if="gi === groups.length - 1 && hasEstimates" #footer>
            موارد «تقریبی» از سوابق قدیمی بازسازی شدن؛ ممکنه تمدیدهای قبلی یا زمان دقیق دریافت هدیه رو نداشته باشن. تراکنش‌های جدید همیشه دقیق ثبت می‌شن.
          </template>
        </Section>
        <div v-if="items.length < total" class="more"><Button stretched mode="bezeled" :loading="loading" @click="more">نمایش بیشتر ({{ fa(total - items.length) }} مورد دیگه)</Button></div>
      </template>

      <Section v-else-if="!loaded"><Skeleton visible><div style="height: 220px" /></Skeleton></Section>
      <Placeholder v-else>
        <TgEmoji :id="E.panda" fallback="wallet" :size="110" loop />
        <template #header>هنوز تراکنشی نداری</template>
        <template #description>بعد از اولین شارژ یا خرید، گردش کیف پولت اینجا نشون داده می‌شه.</template>
      </Placeholder>
    </List>
  </div>
</template>

<style scoped>
.summary-wrap { margin-bottom: 12px; }
.summary { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; align-items: center; padding: 14px 8px; }
.cell-sum { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
.cell-sum b { font-size: 15px; font-weight: 700; white-space: nowrap; }
.cell-sum .sum { direction: ltr; unicode-bidi: isolate; }
.lbl { font-size: 11px; color: var(--tgui-hint-color); }
.vr { width: 1px; align-self: stretch; margin: 2px 0; background: var(--tgui-divider); }
.unit { display: block; margin: 6px 4px 0; font-size: 11px; color: var(--tgui-hint-color); text-align: end; }
.seg { margin-bottom: 8px; }
.in { color: var(--success); }
.out { color: var(--tgui-text-color); }
.wait { color: var(--warning); }
.subj { display: inline-block; font-weight: 500; }
.muted { color: inherit; }
.amt { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.amt b { font-size: 15px; font-weight: 700; white-space: nowrap; }
/* The sign belongs on the left of the digits, so isolate the figure as left-to-right inside RTL text. */
.sum { direction: ltr; unicode-bidi: isolate; }
.time { font-size: 11px; color: var(--tgui-hint-color); }
.more { margin-bottom: var(--block-gap); }
</style>
