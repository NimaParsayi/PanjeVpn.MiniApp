<script setup lang="ts">
import { useRouter } from 'vue-router'
import FIcon from './FIcon.vue'
import { isTelegram } from '@/telegram/webapp'

defineProps<{ title: string; subtitle?: string; back?: boolean | string }>()
const router = useRouter()
</script>

<template>
  <div class="page-title">
    <!-- In Telegram the native Back button is used; this only exists for browser previews. -->
    <button v-if="back && !isTelegram" class="back" type="button" @click="router.back()">
      <FIcon name="chevronStart" :size="18" /> برگشت
    </button>
    <div class="row">
      <div class="grow">
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="sub">{{ subtitle }}</p>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-title { padding: 4px var(--gutter) 16px; }
.row { display: flex; align-items: center; gap: 12px; }
.grow { flex: 1; min-width: 0; }
h1 { margin: 0; font-size: 28px; line-height: 36px; font-weight: 700; color: var(--tgui-text-color); }
.sub { margin: 2px 0 0; font-size: 15px; line-height: 22px; color: var(--tgui-hint-color); }
.back { display: inline-flex; align-items: center; gap: 2px; border: 0; background: none; padding: 0 0 8px; color: var(--tgui-link-color); font: inherit; font-size: 15px; cursor: pointer; }
</style>
