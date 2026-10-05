<script setup lang="ts">
defineProps<{ h?: number; w?: string; r?: number }>()
</script>
<template><div class="sk" :style="{ height: (h ?? 16) + 'px', width: w ?? '100%', borderRadius: (r ?? 6) + 'px' }" /></template>
<style scoped>
.sk { background: linear-gradient(90deg, var(--bg-4) 25%, var(--bg-5) 50%, var(--bg-4) 75%); background-size: 200% 100%; animation: sh 1.4s var(--ease-point) infinite; }
@keyframes sh { from { background-position: 100% 0; } to { background-position: -100% 0; } }
</style>
