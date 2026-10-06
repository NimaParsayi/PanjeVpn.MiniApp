<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Banner, Button, Cell, List, Section, Skeleton } from 'telegram-ui-vue'
import UsageBar from '@/components/UsageBar.vue'
import Tag from '@/components/Tag.vue'
import PageTitle from '@/components/PageTitle.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import FIcon from '@/components/FIcon.vue'
import FQr from '@/components/FQr.vue'
import CopyCell from '@/components/CopyCell.vue'
import { api, type UserService } from '@/api'
import { useUi } from '@/stores/ui'
import { copyText, haptic } from '@/telegram/webapp'
import { ago, date, daysLeft, fa, faDecimal, remaining } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const ui = useUi()
const s = ref<UserService | null>(null)
const showQr = ref(route.query.created === '1')
const justCreated = route.query.created === '1'

onMounted(async () => {
  try { s.value = await api.getService(String(route.params.id)) } catch (e) { ui.toast((e as Error).message, 'error') }
})

const unlimited = computed(() => s.value?.totalGb === 0)
const expired = computed(() => !!s.value && daysLeft(s.value.expireAt) === 0)
const soon = computed(() => !!s.value && !expired.value && (daysLeft(s.value.expireAt) <= 3 || (!unlimited.value && s.value.usedGb / s.value.totalGb >= 0.9)))
const left = computed(() => (unlimited.value || !s.value ? 0 : Math.max(0, s.value.totalGb - s.value.usedGb)))
const pct = computed(() => (unlimited.value || !s.value ? 0 : Math.min(100, (s.value.usedGb / s.value.totalGb) * 100)))

async function copyConfig() {
  if (!s.value) return
  haptic.tap()
  ui.toast((await copyText(s.value.subscriptionUrl)) ? 'لینک کانفیگ کپی شد' : 'کپی انجام نشد', 'success', 1600)
}
</script>

<template>
  <div class="screen">
    <PageTitle :title="justCreated ? 'سرویس ساخته شد' : 'مشخصات سرویس'" back />
    <List v-if="s">
      <Banner v-if="justCreated" type="section">
        <template #before><TgEmoji :id="E.rocket" fallback="checkCircle" :size="32" /></template>
        <template #header>کانفیگ شما ساخته شد!</template>
        <template #subheader>لطفاً تحت هیچ شرایطی کانفیگ رو تو پیام‌رسان‌های داخلی یا پیامک ارسال نکن تا همه متصل بمونیم.</template>
      </Banner>

      <Section>
        <Cell>
          <template #before><ToneIcon :icon="s.icon" :tone="s.tone" :size="48" :emoji="s.emojiId" /></template>
          <span class="ltr name">{{ s.name }}</span>
          <template #subtitle>{{ s.planName }}</template>
          <template #after><Tag :tone="s.unavailable ? 'neutral' : expired ? 'danger' : 'success'" :dot="!s.unavailable">{{ s.unavailable ? 'نامشخص' : expired ? 'منقضی' : 'فعال' }}</Tag></template>
        </Cell>
      </Section>

      <div v-if="!unlimited && !s.unavailable" class="extend">
        <Button stretched size="l" mode="filled" @click="router.push(`/services/${s.id}/extend`)">
          <template #before><FIcon name="refresh" :size="20" /></template>تمدید سرویس
        </Button>
        <span v-if="expired || soon" class="extend-note">{{ expired ? 'این سرویس منقضی شده؛ برای ادامه‌ی اتصال تمدیدش کن.' : 'مدت این سرویس داره تموم می‌شه.' }}</span>
      </div>

      <Banner v-if="s.unavailable" type="section">
        <template #before><TgEmoji :id="E.warning" fallback="warning" :size="32" /></template>
        <template #header>اطلاعات لحظه‌ای در دسترس نیست</template>
        <template #subheader>ارتباط با سرور سرویس برقرار نشد؛ کمی بعد دوباره باز کن.</template>
      </Banner>

      <template v-else>
        <Section>
          <template #header>مصرف</template>
          <Cell multiline>
            <span class="num big">{{ faDecimal(s.usedGb) }}</span>
            <span class="muted"> {{ unlimited ? 'گیگ مصرف‌شده' : `از ${fa(s.totalGb)} گیگابایت` }}</span>
            <template #description>
              <UsageBar v-if="!unlimited" :value="pct" thick class="bar" />
              <span v-if="!unlimited" class="num">{{ faDecimal(left) }} گیگابایت باقی مانده</span>
              <span v-else>حجم نامحدود</span>
            </template>
            <template #after><Tag v-if="!unlimited" :tone="pct >= 90 ? 'danger' : pct >= 75 ? 'warning' : 'info'">{{ fa(Math.round(pct)) }}٪</Tag><Tag v-else tone="success">نامحدود</Tag></template>
          </Cell>
          <Cell><template #before><TgEmoji :id="E.scope" fallback="clock" :size="26" /></template><template #after><span class="num" :class="{ bad: expired }">{{ remaining(s.expireAt) }}</span></template>زمان باقی‌مانده</Cell>
          <Cell><template #before><TgEmoji :id="E.calendar" fallback="calendar" :size="26" /></template><template #after><span class="num">{{ date(s.expireAt) }}</span></template>تاریخ انقضا</Cell>
          <Cell><template #before><TgEmoji :id="E.online" fallback="wifi" :size="26" /></template><template #after><span class="num">{{ ago(s.lastOnlineAt) }}</span></template>آخرین اتصال</Cell>
        </Section>

        <Section>
          <template #header>لینک اتصال</template>
          <div v-if="showQr" class="qr"><FQr :value="s.subscriptionUrl" :size="200" /></div>
          <CopyCell label="آدرس ساب‌اسکریپشن" :value="s.subscriptionUrl" ltr />
          <template #footer>
            <div class="btns">
              <Button stretched mode="bezeled" @click="showQr = !showQr"><template #before><FIcon name="qr" :size="18" /></template>{{ showQr ? 'پنهان‌کردن QR' : 'نمایش QR' }}</Button>
              <Button stretched @click="copyConfig"><template #before><FIcon name="copy" :size="18" /></template>کپی کانفیگ</Button>
            </div>
          </template>
        </Section>

      </template>
    </List>
    <List v-else><Section><Skeleton visible><div style="height: 220px" /></Skeleton></Section></List>
  </div>
</template>

<style scoped>
.name { font-size: 13px; font-weight: 600; }
.big { font-size: 20px; font-weight: 700; }
.muted { color: var(--tgui-hint-color); margin-inline-start: 6px; }
.bar { margin: 10px 0 8px; }
.extend { display: flex; flex-direction: column; gap: 8px; margin-bottom: var(--block-gap); }
.extend-note { font-size: 12px; line-height: 1.7; color: var(--tgui-hint-color); text-align: center; }
.ic { color: var(--tgui-hint-color); }
.bad { color: var(--tgui-destructive-text-color); }
.qr { display: grid; place-items: center; padding: 16px 0 4px; }
.btns { display: flex; gap: 8px; padding-top: 4px; }
</style>
