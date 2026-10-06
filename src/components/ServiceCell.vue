<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Cell } from 'telegram-ui-vue'
import FIcon from './FIcon.vue'
import Tag from './Tag.vue'
import UsageBar from './UsageBar.vue'
import ToneIcon from './ToneIcon.vue'
import { haptic } from '@/telegram/webapp'
import type { UserService } from '@/api'
import { daysLeft, fa, faDecimal, remainingShort } from '@/utils/format'

const props = defineProps<{ service: UserService }>()
const router = useRouter()
const unlimited = computed(() => props.service.totalGb === 0)
const expired = computed(() => daysLeft(props.service.expireAt) === 0)
const nearEnd = computed(() => !expired.value && (daysLeft(props.service.expireAt) <= 3 || (!unlimited.value && props.service.usedGb / props.service.totalGb >= 0.9)))
const pct = computed(() => (unlimited.value ? 0 : Math.min(100, (props.service.usedGb / props.service.totalGb) * 100)))
/** Can be extended (limited plan, panel reachable); highlighted when it is about to run out. */
const canExtend = computed(() => !unlimited.value && !props.service.unavailable)
const urgent = computed(() => expired.value || nearEnd.value)
function renew() {
  haptic.tap()
  router.push(`/services/${props.service.id}/extend`)
}
const usage = computed(() => (unlimited.value ? `${faDecimal(props.service.usedGb)} گیگ مصرف` : `${faDecimal(props.service.usedGb)} از ${fa(props.service.totalGb)} گیگ`))
</script>

<template>
  <Cell multiline @click="router.push(`/services/${service.id}`)">
    <template #before><ToneIcon :icon="service.icon" :tone="service.tone" :size="44" :emoji="service.emojiId" /></template>
    <span class="name">{{ service.name }}</span>
    <template #subtitle>{{ service.planName }}</template>
    <template #description>
      <span v-if="service.unavailable" class="off">اطلاعات مصرف از سرور دریافت نشد؛ کمی بعد دوباره امتحان کن.</span>
      <span v-else class="usage">
        <UsageBar v-if="!unlimited" :value="pct" />
        <span class="row num"><span>{{ usage }}</span><span>{{ remainingShort(service.expireAt) }}</span></span>
      </span>
    </template>
    <template #after>
      <span class="after">
        <Tag v-if="service.unavailable" tone="neutral">نامشخص</Tag>
        <Tag v-else-if="expired" tone="danger" dot>منقضی</Tag>
        <Tag v-else-if="nearEnd" tone="warning" dot>رو به اتمام</Tag>
        <Tag v-else tone="success" dot>فعال</Tag>
        <!-- stop: the whole row opens the details; this goes straight to renewing -->
        <button v-if="canExtend" type="button" class="renew" :class="{ urgent }" @click.stop="renew">
          <FIcon name="refresh" :size="12" :stroke="2.2" />تمدید
        </button>
      </span>
    </template>
  </Cell>
</template>

<style scoped>
.after { display: grid; justify-items: stretch; gap: 6px; min-width: 76px; }
/* Tag and button share one width and edge, so they read as a single column. */
.after :deep(.tag) { justify-content: center; }
.renew {
  display: inline-flex; align-items: center; justify-content: center; gap: 4px; height: 22px; padding: 0 10px;
  border: 0; border-radius: 999px; cursor: pointer; font: inherit; font-size: 11px; font-weight: 600; line-height: 1; white-space: nowrap;
  color: var(--tgui-link-color); background: color-mix(in srgb, var(--tgui-button-color) 15%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tgui-button-color) 28%, transparent);
  transition: transform 160ms cubic-bezier(.34, 1.56, .64, 1);
}
.renew:active { transform: scale(0.95); }
.renew.urgent { color: var(--tgui-button-text-color); background: var(--tgui-button-color); box-shadow: 0 4px 12px color-mix(in srgb, var(--tgui-button-color) 35%, transparent); }
.name { display: inline-block; direction: ltr; unicode-bidi: isolate; font-size: 14px; font-weight: 600; }
.usage { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 2px 12px; }
.row > span { white-space: nowrap; }
.off { display: block; margin-top: 4px; }
</style>
