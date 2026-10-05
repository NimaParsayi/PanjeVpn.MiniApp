<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { AnimationItem } from 'lottie-web'
import FIcon from './FIcon.vue'
import { canPlayEmoji, loadEmoji, loadLottie } from '@/emoji/player'

/**
 * A Telegram custom emoji (animated sticker) from the bot, falling back to a vector icon when the emoji can't be
 * loaded (demo mode, offline, old WebView without DecompressionStream).
 */
const props = withDefaults(defineProps<{
  id?: string | null
  fallback?: string
  size?: number
  /** Bump to replay the animation (e.g. when a tab becomes selected). */
  play?: number
  loop?: boolean
  /** No vector fallback while loading / on failure (the parent draws its own). */
  bare?: boolean
}>(), { size: 32, fallback: 'sparkle', play: 0, loop: false, bare: false })
const emit = defineEmits<{ ready: [] }>()

const host = ref<HTMLElement>()
const ready = ref(false)
let anim: AnimationItem | null = null
let alive = true

async function mount() {
  anim?.destroy(); anim = null; ready.value = false
  if (!props.id || !canPlayEmoji || !host.value) return
  const data = await loadEmoji(props.id)
  if (!data || !alive || !host.value) return
  const lottie = await loadLottie()
  if (!alive || !host.value) return
  anim = lottie.loadAnimation({
    container: host.value, renderer: 'svg', loop: props.loop, autoplay: true, animationData: JSON.parse(JSON.stringify(data)),
    rendererSettings: { progressiveLoad: true, preserveAspectRatio: 'xMidYMid meet' },
  })
  ready.value = true
  emit('ready')
}

onMounted(mount)
watch(() => props.id, mount)
watch(() => props.play, () => anim?.goToAndPlay(0, true))
onBeforeUnmount(() => { alive = false; anim?.destroy() })
</script>

<template>
  <span class="tge" :style="{ width: size + 'px', height: size + 'px' }">
    <FIcon v-if="!ready && !bare" :name="fallback" :size="Math.round(size * 0.62)" class="fb" />
    <span ref="host" class="host" :class="{ on: ready }" />
  </span>
</template>

<style scoped>
.tge { position: relative; display: inline-grid; place-items: center; flex: none; }
.host { position: absolute; inset: 0; opacity: 0; transition: opacity 180ms ease; }
.host.on { opacity: 1; }
.fb { color: var(--tgui-hint-color); }
</style>
