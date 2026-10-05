<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FButton from '@/components/FButton.vue'
import FBadge from '@/components/FBadge.vue'
import FIcon from '@/components/FIcon.vue'
import FProgress from '@/components/FProgress.vue'
import FQr from '@/components/FQr.vue'
import FSkeleton from '@/components/FSkeleton.vue'
import FMessageBar from '@/components/FMessageBar.vue'
import CopyRow from '@/components/CopyRow.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { api, type UserService } from '@/api'
import { useUi } from '@/stores/ui'
import { copyText, haptic } from '@/telegram/webapp'
import { ago, date, daysLeft, fa, faDecimal, remaining } from '@/utils/format'

const route = useRoute()
const ui = useUi()
const s = ref<UserService | null>(null)
const showQr = ref(route.query.created === '1')
const justCreated = route.query.created === '1'

onMounted(async () => {
  try { s.value = await api.getService(String(route.params.id)) } catch (e) { ui.toast((e as Error).message, 'error') }
})

const unlimited = computed(() => s.value?.totalGb === 0)
const expired = computed(() => !!s.value && daysLeft(s.value.expireAt) === 0)
const left = computed(() => (unlimited.value || !s.value ? 0 : Math.max(0, s.value.totalGb - s.value.usedGb)))
const pct = computed(() => (unlimited.value || !s.value ? 0 : Math.round((s.value.usedGb / s.value.totalGb) * 100)))

async function copyConfig() {
  if (!s.value) return
  haptic.tap()
  ui.toast((await copyText(s.value.subscriptionUrl)) ? 'لینک کانفیگ کپی شد' : 'کپی انجام نشد', 'success', 1600)
}
</script>

<template>
  <div class="view">
    <PageHeader :title="justCreated ? 'سرویس ساخته شد' : 'مشخصات سرویس'" back="/services" />
    <main v-if="s" class="page no-nav">
      <FMessageBar v-if="justCreated" intent="success" title="کانفیگ شما ساخته شد!">
        لطفاً تحت هیچ شرایطی کانفیگ رو تو پیام‌رسان‌های داخلی یا پیامک ارسال نکن تا همه متصل بمونیم.
      </FMessageBar>

      <FCard padding="lg">
        <div class="row">
          <ToneIcon :icon="s.icon" :tone="s.tone" :size="48" />
          <div class="grow">
            <div class="name ltr mono">{{ s.name }}</div>
            <div class="muted cap">{{ s.planName }}</div>
          </div>
          <FBadge :tone="expired ? 'danger' : 'success'">{{ expired ? 'منقضی' : 'فعال' }}</FBadge>
        </div>
      </FCard>

      <FMessageBar v-if="s.unavailable" intent="warning" title="اطلاعات لحظه‌ای در دسترس نیست">
        ارتباط با سرور سرویس برقرار نشد؛ کمی بعد دوباره باز کن.
      </FMessageBar>
      <FCard v-else padding="lg">
        <div class="usage">
          <div class="num big">{{ faDecimal(s.usedGb) }}<small> {{ unlimited ? 'گیگ مصرف‌شده' : `از ${fa(s.totalGb)} گیگابایت` }}</small></div>
          <FBadge v-if="!unlimited" :tone="pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'brand'">{{ fa(pct) }}٪</FBadge>
          <FBadge v-else tone="success"><FIcon name="infinity" :size="12" /> نامحدود</FBadge>
        </div>
        <FProgress v-if="!unlimited" :value="s.usedGb" :max="s.totalGb" thick class="bar" />
        <p v-if="!unlimited" class="muted cap num">{{ faDecimal(left) }} گیگابایت باقی مانده</p>

        <div class="divider" />
        <div class="kv"><span><FIcon name="clock" :size="14" /> زمان باقی‌مانده</span><b class="num" :class="{ bad: expired }">{{ remaining(s.expireAt) }}</b></div>
        <div class="kv"><span><FIcon name="calendar" :size="14" /> تاریخ انقضا</span><b class="num">{{ date(s.expireAt) }}</b></div>
        <div class="kv"><span><FIcon name="wifi" :size="14" /> آخرین اتصال</span><b class="num">{{ ago(s.lastOnlineAt) }}</b></div>
      </FCard>

      <FCard v-if="!s.unavailable" padding="lg" class="cfg">
        <div class="section-title"><span>لینک اتصال</span>
          <FButton size="sm" appearance="subtle" icon="qr" @click="showQr = !showQr">{{ showQr ? 'پنهان' : 'QR' }}</FButton>
        </div>
        <Transition name="qr">
          <div v-if="showQr" class="qrbox"><FQr :value="s.subscriptionUrl" :size="200" /></div>
        </Transition>
        <CopyRow label="آدرس ساب‌اسکریپشن" :value="s.subscriptionUrl" ltr />
        <FButton appearance="primary" block icon="copy" @click="copyConfig">کپی کردن کانفیگ</FButton>
      </FCard>

      <FButton v-if="!unlimited && !s.unavailable" appearance="success" size="lg" block icon="refresh" @click="$router.push(`/services/${s.id}/extend`)">تمدید سرویس</FButton>
    </main>

    <main v-else class="page no-nav"><FSkeleton :h="88" :r="8" /><FSkeleton :h="200" :r="8" /><FSkeleton :h="220" :r="8" /></main>
  </div>
</template>

<style scoped>
.name { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
.cap { font: var(--t-caption); }
.usage { display: flex; align-items: center; justify-content: space-between; }
.big { font: var(--t-title3); }
.big small { font: var(--t-body); color: var(--fg-3); }
.bar { margin: var(--s-m) 0 var(--s-s); }
.kv span:first-child { display: inline-flex; align-items: center; gap: 6px; }
.bad { color: var(--danger-fg); }
.cfg { display: flex; flex-direction: column; gap: var(--s-m); }
.cfg .section-title { margin: 0; }
.qrbox { display: grid; place-items: center; padding: var(--s-s) 0; }
.qr-enter-active, .qr-leave-active { transition: all var(--dur-slow) var(--ease-decel); overflow: hidden; }
.qr-enter-from, .qr-leave-to { opacity: 0; max-height: 0; }
.qr-enter-to, .qr-leave-from { max-height: 260px; }
</style>
