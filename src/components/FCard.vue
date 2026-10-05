<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

/** Fluent card. `interactive` adds hover "Reveal" light, pressed state and button semantics. */
withDefaults(defineProps<{ interactive?: boolean; padding?: 'none' | 'sm' | 'md' | 'lg'; tone?: 'default' | 'brand' }>(), {
  padding: 'md', tone: 'default',
})

const el = ref<HTMLElement>()
function move(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !el.value) return
  const r = el.value.getBoundingClientRect()
  el.value.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.value.style.setProperty('--my', `${e.clientY - r.top}px`)
}
onBeforeUnmount(() => (el.value = undefined))
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'" ref="el" class="fcard" :class="[`p-${padding}`, tone, { interactive }]"
    :type="interactive ? 'button' : undefined" @pointermove="interactive && move($event)"
  >
    <slot />
  </component>
</template>

<style scoped>
.fcard {
  position: relative; display: block; width: 100%; text-align: start;
  background: var(--card-bg); color: var(--fg-1);
  border: 1px solid var(--stroke-3); border-radius: var(--r-xl);
  box-shadow: var(--shadow-2); font: inherit; overflow: hidden;
}
.p-none { padding: 0; } .p-sm { padding: var(--s-m); } .p-md { padding: var(--s-l); } .p-lg { padding: var(--s-xl); }
.brand {
  background: linear-gradient(135deg, var(--brand-bg) 0%, var(--brand-2) 100%);
  color: var(--fg-on-brand); border: 0; border-radius: var(--r-2xl); box-shadow: var(--glow);
}
.interactive { cursor: pointer; transition: box-shadow var(--dur-normal) var(--ease-point), transform var(--dur-fast) var(--ease-spring), background var(--dur-fast); }
.interactive::after {
  content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0;
  background: radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--p-button) 14%, transparent), transparent 70%);
  transition: opacity var(--dur-normal);
}
@media (hover: hover) {
  .interactive:hover { box-shadow: var(--shadow-8); transform: translateY(-1px); }
  .interactive:hover::after { opacity: 1; }
}
.interactive:active { transform: scale(0.985); box-shadow: var(--shadow-2); }
</style>
