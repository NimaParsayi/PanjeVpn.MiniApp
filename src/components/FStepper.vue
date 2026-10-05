<script setup lang="ts">
import { ref, watch } from 'vue'
import FIcon from './FIcon.vue'
import { haptic } from '@/telegram/webapp'

const props = defineProps<{
  label: string; icon?: string; display: string; unit?: string
  canDec: boolean; canInc: boolean; editable?: boolean; modelValue?: number
}>()
const emit = defineEmits<{ dec: []; inc: []; 'update:modelValue': [v: number] }>()

const draft = ref('')
watch(() => props.modelValue, (v) => (draft.value = v === undefined ? '' : String(v)), { immediate: true })
function commit() {
  const n = parseInt(draft.value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))), 10)
  if (Number.isFinite(n)) emit('update:modelValue', n)
  else draft.value = String(props.modelValue ?? '')
}
</script>

<template>
  <div class="stepper">
    <div class="lab"><FIcon v-if="icon" :name="icon" :size="18" /><span>{{ label }}</span></div>
    <div class="ctl">
      <button type="button" class="b" :disabled="!canDec" aria-label="کاهش" @click="haptic.select(); emit('dec')"><FIcon name="minus" :size="18" /></button>
      <div class="val">
        <input
          v-if="editable" v-model="draft" class="inp num" inputmode="numeric" :aria-label="label"
          @blur="commit" @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
        <strong v-else class="num">{{ display }}</strong>
        <small v-if="unit">{{ unit }}</small>
      </div>
      <button type="button" class="b" :disabled="!canInc" aria-label="افزایش" @click="haptic.select(); emit('inc')"><FIcon name="plus" :size="18" /></button>
    </div>
  </div>
</template>

<style scoped>
.stepper { display: flex; align-items: center; justify-content: space-between; gap: var(--s-m); }
.lab { display: flex; align-items: center; gap: var(--s-s); color: var(--fg-2); font: var(--t-body-strong); }
.ctl { display: flex; align-items: center; background: var(--bg-4); border-radius: var(--r-lg); padding: var(--s-xs); gap: var(--s-xs); }
.b { width: 42px; height: 42px; display: grid; place-items: center; border: 0; border-radius: var(--r-md); background: var(--bg-1); box-shadow: var(--shadow-2); color: var(--fg-brand); cursor: pointer; transition: transform var(--dur-fast) var(--ease-spring), opacity var(--dur-fast); }
.b:active:not(:disabled) { transform: scale(0.88); }
.b:disabled { color: var(--fg-disabled); box-shadow: none; background: transparent; cursor: not-allowed; }
.val { min-width: 84px; padding: 0 var(--s-xs); display: flex; flex-direction: column; align-items: center; line-height: 1.15; }
strong, .inp { font: var(--t-subtitle2); font-size: 18px; text-align: center; }
.inp { width: 72px; border: 0; background: transparent; outline: none; color: var(--fg-1); }
small { font: var(--t-caption); color: var(--fg-3); }
</style>
