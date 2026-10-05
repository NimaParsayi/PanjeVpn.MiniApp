<script setup lang="ts">
defineProps<{ tone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral' }>()
</script>
<template><span class="badge" :class="tone ?? 'neutral'"><slot /></span></template>
<style scoped>
.badge { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 var(--s-sNudge); border-radius: var(--r-full); font: var(--t-caption); font-weight: 600; white-space: nowrap; }
.brand { background: var(--brand-bg-tint); color: var(--fg-brand); }
.success { background: var(--success-bg); color: var(--success-fg); }
.warning { background: var(--warning-bg); color: var(--warning-fg); }
.danger { background: var(--danger-bg); color: var(--danger-fg); }
.neutral { background: var(--bg-4); color: var(--fg-2); }
</style>
