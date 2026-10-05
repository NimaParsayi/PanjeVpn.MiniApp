<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Tabbar, TabbarItem } from 'telegram-ui-vue'
import TgEmoji from './TgEmoji.vue'
import { E } from '@/emoji/ids'
import { haptic } from '@/telegram/webapp'

const route = useRoute()
const router = useRouter()
const tabs = [
  { to: '/', emoji: E.panda, icon: 'home', label: 'خانه', match: (p: string) => p === '/' },
  { to: '/buy', emoji: E.buy, icon: 'cart', label: 'خرید', match: (p: string) => p.startsWith('/buy') },
  { to: '/services', emoji: E.services, icon: 'shieldCheck', label: 'سرویس‌ها', match: (p: string) => p.startsWith('/services') },
  { to: '/wallet', emoji: E.wallet, icon: 'wallet', label: 'کیف پول', match: (p: string) => p.startsWith('/wallet') },
]
// Replay a tab's animation each time it is selected.
const plays = reactive<Record<string, number>>({})
function go(to: string) {
  haptic.select()
  plays[to] = (plays[to] ?? 0) + 1
  if (route.path !== to) router.push(to)
}
</script>

<template>
  <Tabbar class="app-tabbar">
    <TabbarItem v-for="t in tabs" :key="t.to" :selected="t.match(route.path)" @click="go(t.to)">
      <TgEmoji :id="t.emoji" :fallback="t.icon" :size="28" :play="plays[t.to] ?? 0" />
      <template #text>{{ t.label }}</template>
    </TabbarItem>
  </Tabbar>
</template>

<style>
.app-tabbar { padding-bottom: 6px; }
</style>
