<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Cell } from 'telegram-ui-vue'
import FIcon from './FIcon.vue'
import Tag from './Tag.vue'
import UsageBar from './UsageBar.vue'
import ToneIcon from './ToneIcon.vue'
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
const usage = computed(() => (unlimited.value ? `${faDecimal(props.service.usedGb)} گیگ مصرف شده` : `${faDecimal(props.service.usedGb)} از ${fa(props.service.totalGb)} گیگ`))
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
        <Button v-if="canExtend" size="s" :mode="urgent ? 'filled' : 'bezeled'" @click.stop="router.push(`/services/${service.id}/extend`)">
          <template #before><FIcon name="refresh" :size="15" /></template>تمدید
        </Button>
      </span>
    </template>
  </Cell>
</template>

<style scoped>
.after { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.name { display: inline-block; direction: ltr; unicode-bidi: isolate; font-size: 14px; font-weight: 600; }
.usage { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.row { display: flex; justify-content: space-between; gap: 12px; }
.off { display: block; margin-top: 4px; }
</style>
