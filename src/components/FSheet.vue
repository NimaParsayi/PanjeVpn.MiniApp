<script setup lang="ts">
import { watch } from 'vue'
import FIcon from './FIcon.vue'

const props = defineProps<{ open: boolean; title?: string }>()
const emit = defineEmits<{ close: [] }>()

watch(() => props.open, (o) => { document.documentElement.style.overflow = o ? 'hidden' : '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="wrap" @keydown.esc="emit('close')">
        <div class="scrim" @click="emit('close')" />
        <section class="sheet" role="dialog" aria-modal="true" :aria-label="title">
          <div class="grab" />
          <header v-if="title">
            <h2>{{ title }}</h2>
            <button class="x" type="button" aria-label="بستن" @click="emit('close')"><FIcon name="plus" :size="20" style="transform: rotate(45deg)" /></button>
          </header>
          <div class="body"><slot /></div>
          <footer v-if="$slots.footer"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.wrap { position: fixed; inset: 0; z-index: 80; display: flex; align-items: flex-end; justify-content: center; }
.scrim { position: absolute; inset: 0; background: var(--overlay); }
.sheet {
  position: relative; width: 100%; max-width: 640px; max-height: 88vh; display: flex; flex-direction: column;
  background: var(--bg-1); border-radius: var(--r-3xl) var(--r-3xl) 0 0; box-shadow: var(--shadow-28);
}
.grab { width: 40px; height: 5px; border-radius: 3px; background: var(--stroke-1); margin: var(--s-s) auto 0; }
header { display: flex; align-items: center; justify-content: space-between; padding: var(--s-m) var(--s-l) 0; }
h2 { font: var(--t-subtitle1); }
.x { width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: var(--r-md); background: transparent; color: var(--fg-2); cursor: pointer; }
.x:hover { background: var(--bg-subtle-hover); }
.body { padding: var(--s-m) var(--s-l); overflow-y: auto; }
footer { padding: var(--s-s) var(--s-l) calc(var(--safe-bottom) + var(--s-l)); display: flex; gap: var(--s-s); }
.sheet-enter-active .scrim, .sheet-leave-active .scrim { transition: opacity var(--dur-slow); }
.sheet-enter-active .sheet { transition: transform var(--dur-slow) var(--ease-decel); }
.sheet-leave-active .sheet { transition: transform var(--dur-normal) var(--ease-accel); }
.sheet-enter-from .scrim, .sheet-leave-to .scrim { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }
</style>
