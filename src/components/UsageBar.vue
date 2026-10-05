<script setup lang="ts">
import { computed } from 'vue'
import { Progress } from 'telegram-ui-vue'

// telegram-ui's Progress only draws the filled part, so the track is drawn here. Colour follows usage.
const props = withDefaults(defineProps<{ value: number; thick?: boolean }>(), { thick: false })
const color = computed(() => (props.value >= 90 ? 'var(--tgui-destructive-text-color)' : props.value >= 75 ? 'var(--warning)' : 'var(--tgui-button-color)'))
</script>

<template>
  <span class="track" :class="{ thick }" :style="{ '--bar': color }" role="progressbar" :aria-valuenow="Math.round(value)" aria-valuemin="0" aria-valuemax="100">
    <Progress :value="value" class="fill" />
  </span>
</template>

<style scoped>
.track { display: block; height: 6px; border-radius: 999px; overflow: hidden; background: color-mix(in srgb, var(--tgui-hint-color) 24%, transparent); }
.track.thick { height: 10px; }
.fill { height: 100%; }
.fill, .fill :deep(*) { --tgui-button-color: var(--bar); border-radius: 999px; }
.fill :deep(*) { background: var(--bar); height: 100%; }
</style>
