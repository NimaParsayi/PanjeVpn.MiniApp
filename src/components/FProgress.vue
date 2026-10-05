<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ value: number; max?: number; tone?: 'auto' | 'brand' | 'success'; thick?: boolean }>(), { max: 100, tone: 'auto' })
const pct = computed(() => Math.min(100, Math.max(0, props.max > 0 ? (props.value / props.max) * 100 : 0)))
const color = computed(() => {
  if (props.tone === 'success') return 'linear-gradient(90deg, #34c25e, #1fa14a)'
  if (props.tone === 'brand') return 'linear-gradient(90deg, var(--brand-bg), var(--brand-2))'
  return pct.value >= 95 ? 'var(--danger-solid)' : pct.value >= 80 ? 'linear-gradient(90deg, #fbbf24, var(--warning-solid))' : 'linear-gradient(90deg, var(--brand-bg), var(--brand-2))'
})
</script>

<template>
  <div class="bar" :class="{ thick }" role="progressbar" :aria-valuenow="Math.round(pct)" aria-valuemin="0" aria-valuemax="100">
    <div class="fill" :style="{ width: pct + '%', background: color }" />
  </div>
</template>

<style scoped>
.bar { height: 6px; border-radius: var(--r-full); background: var(--bg-5); overflow: hidden; }
.bar.thick { height: 12px; }
.fill { height: 100%; border-radius: inherit; transition: width 700ms var(--ease-decel), background var(--dur-normal); }
</style>
