<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="field">
    <div class="lbl">{{ label }}</div>
    <slot />
  </div>
</template>

<style scoped>
/* A visible caption that stays put after the input is filled (placeholders disappear). */
.field { padding-top: 10px; }
.field + .field { border-top: 1px solid var(--glass-edge, rgba(255, 255, 255, 0.06)); }
.lbl { padding: 0 20px; font-size: 12.5px; font-weight: 600; color: var(--tgui-hint-color); }
</style>
