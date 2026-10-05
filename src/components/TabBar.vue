<script setup lang="ts">
import { useRoute } from 'vue-router'
import FIcon from './FIcon.vue'
import { haptic } from '@/telegram/webapp'

const route = useRoute()
const tabs = [
  { to: '/', icon: 'home', label: 'خانه', match: (p: string) => p === '/' },
  { to: '/buy', icon: 'cart', label: 'خرید', match: (p: string) => p.startsWith('/buy') },
  { to: '/services', icon: 'shieldCheck', label: 'سرویس‌ها', match: (p: string) => p.startsWith('/services') },
  { to: '/wallet', icon: 'wallet', label: 'کیف پول', match: (p: string) => p.startsWith('/wallet') },
]
</script>

<template>
  <nav class="tabbar" aria-label="ناوبری اصلی">
    <RouterLink
      v-for="t in tabs" :key="t.to" :to="t.to" class="tab" :class="{ active: t.match(route.path) }"
      :aria-current="t.match(route.path) ? 'page' : undefined" @click="haptic.select()"
    >
      <span class="ind" />
      <FIcon :name="t.icon" :size="22" :stroke="t.match(route.path) ? 2.1 : 1.7" />
      <span class="lbl">{{ t.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tabbar {
  position: fixed; inset-inline: var(--s-m); bottom: calc(var(--safe-bottom) + var(--s-m)); z-index: 30;
  max-width: 400px; margin-inline: auto;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s-xs); padding: var(--s-xs);
  background: color-mix(in srgb, var(--p-section) 78%, transparent);
  border: 1px solid var(--stroke-3); border-radius: var(--r-full);
  box-shadow: var(--shadow-16);
  backdrop-filter: blur(28px) saturate(180%); -webkit-backdrop-filter: blur(28px) saturate(180%);
}
.tab {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
  height: 54px; border-radius: var(--r-full); color: var(--fg-3); text-decoration: none;
  transition: color var(--dur-fast), transform var(--dur-fast) var(--ease-spring);
}
.tab:active { transform: scale(0.92); }
.tab > * { position: relative; z-index: 1; }
.lbl { font: var(--t-caption); font-size: 10.5px; line-height: 14px; font-weight: 500; }
.active { color: var(--fg-brand); }
.active .lbl { font-weight: 700; }
.ind {
  position: absolute !important; inset: 0; z-index: 0 !important; border-radius: var(--r-full);
  background: var(--brand-bg-tint); transform: scale(0.6); opacity: 0;
  transition: transform var(--dur-slow) var(--ease-spring), opacity var(--dur-normal);
}
.active .ind { transform: scale(1); opacity: 1; }
</style>
