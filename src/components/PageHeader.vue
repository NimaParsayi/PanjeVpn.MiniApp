<script setup lang="ts">
import { useRouter } from 'vue-router'
import FIcon from './FIcon.vue'

const props = defineProps<{ title: string; subtitle?: string; back?: boolean | string }>()
const router = useRouter()
const goBack = () => (typeof props.back === 'string' ? router.replace(props.back) : router.back())
</script>

<template>
  <header class="ph">
    <button v-if="back" class="back" type="button" aria-label="برگشت" @click="goBack"><FIcon name="chevronStart" :size="22" /></button>
    <div class="titles">
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="actions"><slot /></div>
  </header>
</template>

<style scoped>
.ph {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; gap: var(--s-m);
  padding: calc(var(--content-top) + var(--s-m)) max(var(--s-l), calc((100% - 640px) / 2 + var(--s-l))) var(--s-m);
  background: color-mix(in srgb, var(--bg-canvas) 70%, transparent);
  backdrop-filter: blur(24px) saturate(170%); -webkit-backdrop-filter: blur(24px) saturate(170%);
}
.back {
  width: 40px; height: 40px; display: grid; place-items: center; flex: none;
  border: 0; border-radius: 50%; background: var(--bg-1); box-shadow: var(--shadow-2); cursor: pointer; color: var(--fg-1);
  transition: transform var(--dur-fast) var(--ease-spring), background var(--dur-fast);
}
.back:active { transform: scale(0.9); }
.titles { flex: 1; min-width: 0; }
h1 { font: var(--t-subtitle1); font-size: 22px; letter-spacing: -0.2px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
p { font: var(--t-caption); color: var(--fg-3); margin-top: 1px; }
.actions { display: flex; gap: var(--s-xs); }
</style>
