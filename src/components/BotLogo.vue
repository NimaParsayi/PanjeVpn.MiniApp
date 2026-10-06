<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import TgEmoji from './TgEmoji.vue'
import { api } from '@/api'
import { E } from '@/emoji/ids'

/** The bot's profile photo; until one is set in BotFather the bot's own panda emoji stands in as the logo. */
const props = withDefaults(defineProps<{ size?: number }>(), { size: 52 })

let cached: Promise<string | null> | null = null
const src = ref<string | null>(null)
let url: string | null = null

onMounted(async () => {
  cached ??= api.getLogo().then((b) => (b ? (url = URL.createObjectURL(b)) : null)).catch(() => null)
  src.value = await cached
})
onBeforeUnmount(() => { /* kept for the session: the object URL is shared by every instance */ })
</script>

<template>
  <span class="logo" :style="{ width: size + 'px', height: size + 'px' }">
    <img v-if="src" :src="src" alt="" />
    <TgEmoji v-else :id="E.panda" fallback="shieldCheck" :size="Math.round(props.size * 0.78)" />
  </span>
</template>

<style scoped>
.logo { display: inline-grid; place-items: center; flex: none; overflow: hidden; border-radius: 30%; background: var(--glass-bg); box-shadow: var(--glass-hl), 0 0 0 1px var(--glass-edge) inset, 0 6px 18px rgba(0, 0, 0, 0.12); }
.logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
