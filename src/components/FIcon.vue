<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name: string; size?: number; stroke?: number }>(), { size: 20, stroke: 1.7 })

const C = 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z'
// Stroke icons drawn on a 24×24 grid in the Fluent "regular" spirit. "|" separates sub-paths.
const icons: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  cart: 'M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h8.2a1 1 0 0 0 1-.8L19 8H6|M9.5 20a1 1 0 1 0 2 0 1 1 0 1 0-2 0|M15.5 20a1 1 0 1 0 2 0 1 1 0 1 0-2 0',
  shield: 'M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z',
  shieldCheck: 'M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z|M8.5 12l2.5 2.5 4.5-5',
  wallet: 'M4 7a2 2 0 0 1 2-2h12v4|M4 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H6a2 2 0 0 1-2-2z|M16.5 14.5h.01',
  gift: 'M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z|M3 7h18v4H3z|M12 7v14|M12 7c-1-3-5-4-5-1.5C7 7 9 7 12 7zM12 7c1-3 5-4 5-1.5 0 1.5-2 1.5-5 1.5z',
  headset: 'M4 14v-2a8 8 0 0 1 16 0v2|M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1z|M20 19c0 1.5-2 2-5 2',
  coin: `${C}|M12 7v10|M14.5 9.5c-.5-1-1.4-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1.1 0-2-.5-2.5-1.5`,
  flash: 'M13 2 4 14h7l-1 8 9-12h-7z',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15|M5 19c3-5 6-7 10-9',
  infinity: 'M12 12c-1.5-2-3-3.5-5-3.5a3.5 3.5 0 0 0 0 7c2 0 3.5-1.5 5-3.5zm0 0c1.5 2 3 3.5 5 3.5a3.5 3.5 0 0 0 0-7c-2 0-3.5 1.5-5 3.5z',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z|M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6|M16 4.3a3.5 3.5 0 0 1 0 6.4|M18 14.3c2.2.7 3.5 2.7 3.5 5.7',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M4 21c0-4 3.6-7 8-7s8 3 8 7',
  copy: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1z|M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  checkCircle: `${C}|M8 12.3l2.8 2.8L16 9.5`,
  chevronEnd: 'M15 6l-6 6 6 6',
  chevronStart: 'M9 6l6 6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  clock: `${C}|M12 7v5l3 2`,
  chart: 'M3 20h18|M6 20v-6|M11 20V6|M16 20v-9|M21 20V9',
  wifi: 'M2 9a15 15 0 0 1 20 0|M5 12.5a10.5 10.5 0 0 1 14 0|M8.5 16a5.5 5.5 0 0 1 7 0|M12 19.5h.01',
  qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z|M14 14h2v2h-2zM18 14h2v2M14 18h2v2m4-2v2h-2',
  refresh: 'M20 12a8 8 0 1 1-2.5-5.8|M20 4v5h-5',
  star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z',
  ton: 'M5 6h14l-7 14z|M12 6v14',
  send: 'M21 3 10 14|M21 3l-7 18-4-7-7-4z',
  megaphone: 'M3 11v3a1 1 0 0 0 1 1h2l8 4V7L6 10H4a1 1 0 0 0-1 1z|M18 9a4 4 0 0 1 0 6',
  backspace: 'M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z|M12.5 9.5l5 5M17.5 9.5l-5 5',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1|M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  tag: 'M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z|M8 8h.01',
  warning: 'M12 3l10 18H2z|M12 10v5|M12 18h.01',
  info: `${C}|M12 11v5|M12 8h.01`,
  error: `${C}|M9 9l6 6M15 9l-6 6`,
  calendar: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z|M4 10h16|M8 3v4M16 3v4',
  globe: `${C}|M3 12h18|M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18`,
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z|M19 16v4M17 18h4',
  lock: 'M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z|M8 11V8a4 4 0 0 1 8 0v3',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
}

const paths = computed(() => (icons[props.name] ?? icons.info).split('|'))
</script>

<template>
  <svg
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ficon"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<style scoped>
.ficon { flex: none; display: block; }
</style>
