<script setup lang="ts">
import { ref, watch } from 'vue'
import FIcon from './FIcon.vue'
import TgEmoji from './TgEmoji.vue'

const props = withDefaults(defineProps<{ icon: string; tone?: 'success' | 'primary' | 'danger' | 'neutral'; size?: number; emoji?: string | null }>(), { tone: 'primary', size: 40 })
// Starts as a coloured vector tile; swaps to the bot's animated emoji once it has loaded.
const loaded = ref(false)
watch(() => props.emoji, () => (loaded.value = false))
</script>

<template>
  <span class="tone" :class="[tone, { 'has-emoji': loaded }]" :style="{ width: size + 'px', height: size + 'px' }">
    <FIcon v-if="!loaded" :name="icon" :size="Math.round(size * 0.55)" :stroke="1.9" />
    <TgEmoji v-if="emoji" :id="emoji" bare :size="Math.round(size * 0.84)" class="em" @ready="loaded = true" />
  </span>
</template>

<style scoped>
/* Coloured squares like Telegram's Settings rows; they turn into a quiet glass tile around the emoji. */
.tone { position: relative; display: inline-grid; place-items: center; border-radius: 30%; flex: none; transition: background 200ms; }
.em { position: absolute; inset: 0; margin: auto; }
.primary { background: var(--tgui-button-color); color: var(--tgui-button-text-color); }
.success { background: var(--success); color: #fff; }
.danger { background: var(--tgui-destructive-text-color); color: #fff; }
.neutral { background: color-mix(in srgb, var(--tgui-hint-color) 30%, transparent); color: var(--tgui-text-color); }
.has-emoji { background: color-mix(in srgb, var(--tgui-text-color) 6%, transparent); }
</style>
