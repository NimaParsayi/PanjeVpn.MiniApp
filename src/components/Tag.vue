<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral'; dot?: boolean }>(), { tone: 'info', dot: false })
</script>

<template>
  <span class="tag" :class="tone"><i v-if="dot" class="dot" aria-hidden="true" /><slot /></span>
</template>

<style scoped>
/* Soft tinted capsule: one line, fixed height, never wider than its text, readable in light and dark. */
.tag {
  --c: var(--tgui-link-color);
  display: inline-flex; align-items: center; gap: 6px; flex: none;
  height: 22px; padding: 0 9px; border-radius: 999px;
  font-size: 11px; line-height: 1; font-weight: 600; white-space: nowrap;
  background: color-mix(in srgb, var(--c) 15%, transparent);
  color: color-mix(in srgb, var(--c) 78%, var(--tgui-text-color));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 20%, transparent);
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); }
.success { --c: var(--success); }
.warning { --c: var(--warning); }
.danger { --c: var(--tgui-destructive-text-color); }
.neutral { --c: var(--tgui-hint-color); }
</style>
