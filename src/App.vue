<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { AppRoot, Button, Placeholder, Skeleton } from 'telegram-ui-vue'
import AppTabbar from '@/components/AppTabbar.vue'
import ToastHost from '@/components/ToastHost.vue'
import FIcon from '@/components/FIcon.vue'
import { useApp } from '@/stores/app'
import { isDark } from '@/telegram/palette'
import { uiPlatform } from '@/telegram/webapp'

const app = useApp()
const route = useRoute()
const showTabs = computed(() => !!route.meta.tab)
onMounted(() => app.boot())
</script>

<template>
  <AppRoot :platform="uiPlatform" :appearance="isDark ? 'dark' : 'light'">
    <template v-if="app.loaded">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="r.path" />
        </Transition>
      </RouterView>
      <AppTabbar v-if="showTabs" />
    </template>

    <div v-else-if="app.loadError" class="screen">
      <Placeholder>
        <TgEmoji :id="E.panda" fallback="error" :size="120" />
        <template #header>اتصال برقرار نشد</template>
        <template #description>{{ app.loadError }}</template>
        <template #action><Button size="m" @click="app.boot()"><FIcon name="refresh" :size="18" /> تلاش دوباره</Button></template>
      </Placeholder>
    </div>

    <div v-else class="screen pad stack">
      <Skeleton visible><div style="height: 56px" /></Skeleton>
      <Skeleton visible><div style="height: 150px; border-radius: 20px" /></Skeleton>
      <Skeleton visible><div style="height: 220px; border-radius: 16px" /></Skeleton>
    </div>

    <ToastHost />
  </AppRoot>
</template>
