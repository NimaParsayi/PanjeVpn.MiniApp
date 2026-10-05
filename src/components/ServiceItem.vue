<script setup lang="ts">
import { computed } from 'vue'
import FCard from './FCard.vue'
import FIcon from './FIcon.vue'
import FProgress from './FProgress.vue'
import FBadge from './FBadge.vue'
import ToneIcon from './ToneIcon.vue'
import type { UserService } from '@/api'
import { daysLeft, fa, faDecimal, remaining } from '@/utils/format'

const props = defineProps<{ service: UserService }>()
const unlimited = computed(() => props.service.totalGb === 0)
const expired = computed(() => daysLeft(props.service.expireAt) === 0)
const nearEnd = computed(() => !expired.value && (daysLeft(props.service.expireAt) <= 3 || (!unlimited.value && props.service.usedGb / props.service.totalGb >= 0.9)))
</script>

<template>
  <FCard interactive padding="md" @click="$router.push(`/services/${service.id}`)">
    <div class="top">
      <ToneIcon :icon="service.icon" :tone="service.tone" />
      <div class="grow">
        <div class="name ltr mono">{{ service.name }}</div>
        <div class="muted plan">{{ service.planName }}</div>
      </div>
      <FBadge v-if="service.unavailable" tone="neutral">نامشخص</FBadge>
      <FBadge v-else-if="expired" tone="danger">منقضی</FBadge>
      <FBadge v-else-if="nearEnd" tone="warning">رو به اتمام</FBadge>
      <FBadge v-else tone="success">فعال</FBadge>
      <FIcon name="chevronEnd" :size="18" class="chev" />
    </div>
 <p v-if="service.unavailable" class="muted off">اطلاعات مصرف از سرور دریافت نشد؛ کمی بعد دوباره امتحان کن.</p>
    <template v-else>
    <FProgress v-if="!unlimited" :value="service.usedGb" :max="service.totalGb" class="bar" />
    <div class="meta">
      <span class="num">{{ unlimited ? `${faDecimal(service.usedGb)} گیگ مصرف‌شده` : `${faDecimal(service.usedGb)} از ${fa(service.totalGb)} گیگ` }}</span>
      <span class="muted">{{ remaining(service.expireAt) }}</span>
    </div>
    </template>
  </FCard>
</template>

<style scoped>
.top { display: flex; align-items: center; gap: var(--s-m); }
.name { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.plan { font: var(--t-caption); }
.chev { color: var(--fg-4); }
.off { font: var(--t-caption); margin-top: var(--s-m); }
.bar { margin-top: var(--s-m); }
.meta { display: flex; justify-content: space-between; margin-top: var(--s-s); font: var(--t-caption); }
</style>
