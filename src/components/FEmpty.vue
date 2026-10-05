<script setup lang="ts">
import FIcon from './FIcon.vue'
defineProps<{ icon: string; title: string; text?: string }>()
</script>
<template>
  <div class="empty">
    <span class="ic"><FIcon :name="icon" :size="30" /></span>
    <h3>{{ title }}</h3>
    <p v-if="text">{{ text }}</p>
    <slot />
  </div>
</template>
<style scoped>
.empty { display: flex; flex-direction: column; align-items: center; gap: var(--s-s); text-align: center; padding: var(--s-xxxl) var(--s-l); }
.ic { width: 64px; height: 64px; display: grid; place-items: center; border-radius: 50%; background: var(--brand-bg-tint); color: var(--fg-brand); margin-bottom: var(--s-s); }
h3 { font: var(--t-subtitle2); } p { color: var(--fg-3); max-width: 280px; margin-bottom: var(--s-m); }
</style>
