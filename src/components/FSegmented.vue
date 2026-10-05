<script setup lang="ts" generic="T extends string | number">
import { haptic } from '@/telegram/webapp'

defineProps<{ options: { value: T; label: string; sub?: string }[] }>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="seg" role="radiogroup" :style="{ '--n': Math.min(options.length, 5) }">
    <button
      v-for="o in options" :key="String(o.value)" type="button" role="radio" class="opt"
      :class="{ on: o.value === model }" :aria-checked="o.value === model"
      @click="haptic.select(); model = o.value"
    >
      <span class="l num">{{ o.label }}</span>
      <span v-if="o.sub" class="s">{{ o.sub }}</span>
    </button>
  </div>
</template>

<style scoped>
.seg { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)); gap: var(--s-xs); padding: var(--s-xs); background: var(--bg-4); border-radius: var(--r-lg); }
.opt {
  display: flex; flex-direction: column; align-items: center; gap: 1px; padding: var(--s-s) 0;
  background: transparent; border: 0; border-radius: var(--r-md); color: var(--fg-2);
  cursor: pointer; transition: all var(--dur-normal) var(--ease-point);
}
.opt:active { transform: scale(0.95); }
.opt.on { background: var(--bg-1); color: var(--fg-brand); box-shadow: var(--shadow-4); }
.l { font: var(--t-body-strong); }
.s { font: var(--t-caption); font-size: 11px; color: var(--fg-3); }
.on .s { color: var(--fg-brand); }
</style>
