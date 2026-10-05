<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label?: string; hint?: string; error?: string; placeholder?: string; type?: string; inputmode?: 'text' | 'numeric' | 'decimal'
  suffix?: string; ltr?: boolean; multiline?: boolean; rows?: number; maxlength?: number
}>()
const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="field" :class="{ invalid: !!error }">
    <label v-if="label" :for="id">{{ label }}</label>
    <div class="ctl">
      <textarea v-if="multiline" :id="id" v-model="model" :rows="rows ?? 5" :placeholder="placeholder" :maxlength="maxlength" />
      <input
        v-else :id="id" v-model="model" :type="type ?? 'text'" :inputmode="inputmode" :placeholder="placeholder" :maxlength="maxlength"
        :class="{ ltr }" autocomplete="off" autocapitalize="off" spellcheck="false"
      />
      <span v-if="suffix" class="suffix">{{ suffix }}</span>
    </div>
    <p v-if="error" class="msg err">{{ error }}</p>
    <p v-else-if="hint" class="msg">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field { display: flex; flex-direction: column; gap: var(--s-xs); }
label { font: var(--t-body-strong); color: var(--fg-1); }
.ctl {
  position: relative; display: flex; align-items: center; background: var(--bg-4); border-radius: var(--r-lg);
  box-shadow: inset 0 0 0 1.5px transparent; transition: box-shadow var(--dur-normal) var(--ease-point), background var(--dur-fast);
}
.ctl:focus-within { background: var(--bg-1); box-shadow: inset 0 0 0 1.5px var(--brand-stroke), 0 0 0 4px color-mix(in srgb, var(--p-button) 18%, transparent); }
input, textarea { flex: 1; min-width: 0; width: 100%; min-height: 48px; padding: 0 var(--s-l); border: 0; background: transparent; outline: none; font: var(--t-body); color: var(--fg-1); }
input.ltr { direction: ltr; text-align: left; }
textarea { padding: var(--s-m) var(--s-l); resize: none; line-height: 22px; }
.suffix { padding-inline-end: var(--s-l); color: var(--fg-3); font: var(--t-caption); }
.invalid .ctl { box-shadow: inset 0 0 0 1.5px var(--danger-solid); }
.msg { font: var(--t-caption); color: var(--fg-3); }
.err { color: var(--danger-fg); }
</style>
