<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Cell } from 'telegram-ui-vue'
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
      <Tag v-if="service.unavailable" tone="neutral">نامشخص</Tag>
      <Tag v-else-if="expired" tone="danger" dot>منقضی</Tag>
      <Tag v-else-if="nearEnd" tone="warning" dot>رو به اتمام</Tag>
      <Tag v-else tone="success" dot>فعال</Tag>
    </template>
  </Cell>
</template>

<style scoped>
.name { display: inline-block; direction: ltr; unicode-bidi: isolate; font-size: 15px; font-weight: 600; }
.usage { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.row { display: flex; justify-content: space-between; gap: 12px; }
.off { display: block; margin-top: 4px; }
</style>
