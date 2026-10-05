<script setup lang="ts">
import { computed } from 'vue'
import FCard from './FCard.vue'
import FStepper from './FStepper.vue'
import FSegmented from './FSegmented.vue'
import type { Plan } from '@/api'
import { canDecrease, canIncrease, isUnlimited, nextSize, prevSize } from '@/utils/pricing'
import { fa } from '@/utils/format'

const props = defineProps<{ plan: Plan }>()
const size = defineModel<number>('size', { required: true })
const daysIndex = defineModel<number>('daysIndex', { required: true })

const unlimited = computed(() => isUnlimited(props.plan))
const dayOptions = computed(() => props.plan.days.map((d, i) => ({ value: i, label: fa(d), sub: 'روز' })))

function setSize(n: number) {
  const max = props.plan.maxSize === -1 ? Infinity : props.plan.maxSize
  size.value = Math.min(max, Math.max(props.plan.minSize, n))
}
</script>

<template>
  <FCard padding="lg" class="picker">
    <template v-if="!unlimited">
      <FStepper
        label="حجم" icon="chart" :display="fa(size)" unit="گیگابایت" editable :model-value="size"
        :can-dec="canDecrease(plan, size)" :can-inc="canIncrease(plan, size)"
        @dec="setSize(prevSize(plan, size))" @inc="setSize(nextSize(plan, size))" @update:model-value="setSize"
      />
      <p class="hint muted">
        حداقل {{ fa(plan.minSize) }}{{ plan.maxSize === -1 ? '' : ` و حداکثر ${fa(plan.maxSize)}` }} گیگابایت · می‌تونی روی عدد بزنی و حجم دلخواه بنویسی.
      </p>
      <div class="divider" />
    </template>
    <div class="sub">مدت زمان</div>
    <FSegmented v-model="daysIndex" :options="dayOptions" />
  </FCard>
</template>

<style scoped>
.picker { display: flex; flex-direction: column; gap: var(--s-m); }
.hint { font: var(--t-caption); margin-top: calc(var(--s-xs) * -1); }
.sub { font: var(--t-body-strong); color: var(--fg-2); }
</style>
