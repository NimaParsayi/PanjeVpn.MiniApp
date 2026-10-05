<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(defineProps<{ value: string; size?: number }>(), { size: 220 })
const url = ref('')
watchEffect(async () => {
  // QR codes need a light background to stay scannable, in dark mode too.
  url.value = await QRCode.toDataURL(props.value, { margin: 1, width: props.size * 2, errorCorrectionLevel: 'Q', color: { dark: '#1b1b1b', light: '#ffffff' } })
})
</script>
<template><img v-if="url" class="qr" :src="url" :width="size" :height="size" alt="QR code" /></template>
<style scoped>.qr { display: block; border-radius: var(--r-xl); background: #fff; padding: var(--s-s); box-shadow: var(--shadow-4); }</style>
