<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button, Cell } from 'telegram-ui-vue'
import FIcon from './FIcon.vue'
import { haptic } from '@/telegram/webapp'

const props = defineProps<{ label: string; unit?: string; display: string; canDec: boolean; canInc: boolean; editable?: boolean; modelValue?: number }>()
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
  <Cell>
    {{ label }}
    <template #after>
      <div class="ctl">
        <Button mode="gray" size="s" :disabled="!canDec" aria-label="کاهش" @click="haptic.select(); emit('dec')"><FIcon name="minus" :size="18" /></Button>
        <div class="val">
          <input v-if="editable" v-model="draft" class="inp num" inputmode="numeric" :aria-label="label" @blur="commit" @keydown.enter="($event.target as HTMLInputElement).blur()" />
          <b v-else class="num">{{ display }}</b>
          <small v-if="unit">{{ unit }}</small>
        </div>
        <Button mode="gray" size="s" :disabled="!canInc" aria-label="افزایش" @click="haptic.select(); emit('inc')"><FIcon name="plus" :size="18" /></Button>
      </div>
    </template>
  </Cell>
</template>

<style scoped>
.ctl { display: flex; align-items: center; gap: 4px; }
.val { min-width: 72px; display: flex; flex-direction: column; align-items: center; line-height: 1.2; color: var(--tgui-text-color); }
.val b, .inp { font-size: 16px; font-weight: 600; text-align: center; }
.inp { width: 64px; border: 0; background: transparent; outline: none; color: inherit; padding: 0; }
small { font-size: 11px; color: var(--tgui-hint-color); }
</style>
