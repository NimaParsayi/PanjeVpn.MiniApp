<script setup lang="ts">
import FIcon from './FIcon.vue'
withDefaults(defineProps<{ icon: string; tone?: 'success' | 'primary' | 'danger' | 'neutral'; size?: number }>(), { tone: 'primary', size: 40 })
</script>

<template>
  <span class="tone" :class="tone" :style="{ width: size + 'px', height: size + 'px' }">
    <FIcon :name="icon" :size="Math.round(size * 0.5)" />
  </span>
</template>

<style scoped>
.tone { display: inline-grid; place-items: center; border-radius: 30%; flex: none; }
.primary { background: linear-gradient(145deg, color-mix(in srgb, var(--p-button) 22%, var(--p-section)), color-mix(in srgb, var(--p-button) 10%, var(--p-section))); color: var(--fg-brand); }
.success { background: linear-gradient(145deg, color-mix(in srgb, var(--success-solid) 24%, var(--p-section)), color-mix(in srgb, var(--success-solid) 10%, var(--p-section))); color: var(--success-fg); }
.danger { background: linear-gradient(145deg, color-mix(in srgb, var(--p-destructive) 22%, var(--p-section)), color-mix(in srgb, var(--p-destructive) 9%, var(--p-section))); color: var(--danger-fg); }
.neutral { background: var(--bg-4); color: var(--fg-2); }
</style>
