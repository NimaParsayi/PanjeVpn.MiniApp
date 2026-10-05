<script setup lang="ts">
import { computed } from 'vue'
import { Section, SegmentedControl, SegmentedControlItem } from 'telegram-ui-vue'
import Stepper from './Stepper.vue'
import type { Plan } from '@/api'
import { canDecrease, canIncrease, isUnlimited, nextSize, prevSize } from '@/utils/pricing'
import { fa } from '@/utils/format'
import { haptic } from '@/telegram/webapp'

const props = defineProps<{ plan: Plan }>()
const size = defineModel<number>('size', { required: true })
const daysIndex = defineModel<number>('daysIndex', { required: true })
const unlimited = computed(() => isUnlimited(props.plan))

function setSize(n: number) {
  const max = props.plan.maxSize === -1 ? Infinity : props.plan.maxSize
  size.value = Math.min(max, Math.max(props.plan.minSize, n))
}
</script>

<template>
  <Section v-if="!unlimited">
    <template #header>حجم</template>
    <Stepper
      label="حجم" unit="گیگابایت" :display="fa(size)" editable :model-value="size"
      :can-dec="canDecrease(plan, size)" :can-inc="canIncrease(plan, size)"
      @dec="setSize(prevSize(plan, size))" @inc="setSize(nextSize(plan, size))" @update:model-value="setSize"
    />
    <template #footer>
      حداقل {{ fa(plan.minSize) }}{{ plan.maxSize === -1 ? '' : ` و حداکثر ${fa(plan.maxSize)}` }} گیگابایت. می‌تونی روی عدد بزنی و حجم دلخواه بنویسی.
    </template>
  </Section>

  <Section>
    <template #header>مدت زمان (روز)</template>
    <div class="seg">
      <SegmentedControl>
        <SegmentedControlItem v-for="(d, i) in plan.days" :key="i" :selected="i === daysIndex" @click="haptic.select(); daysIndex = i">
          {{ fa(d) }}
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  </Section>
</template>

<style scoped>
.seg { padding: 8px 16px 12px; }
/* The kit pads items for 2-3 options; we can have five durations. */
.seg :deep([class*='segmented-control-item']) { padding-inline: 4px; min-width: 0; }
</style>
