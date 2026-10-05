<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from '@/components/TabBar.vue'
import ToastHost from '@/components/ToastHost.vue'
import FButton from '@/components/FButton.vue'
import FSkeleton from '@/components/FSkeleton.vue'
import FEmpty from '@/components/FEmpty.vue'
import { useApp } from '@/stores/app'

const app = useApp()
const route = useRoute()
const showTabs = computed(() => !!route.meta.tab)
onMounted(() => app.boot())
</script>

<template>
  <template v-if="app.loaded">
    <RouterView v-slot="{ Component, route: r }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="r.path" />
      </Transition>
    </RouterView>
    <Transition name="page"><TabBar v-if="showTabs" /></Transition>
  </template>

  <div v-else-if="app.loadError" class="boot">
    <FEmpty icon="error" title="اتصال برقرار نشد" :text="app.loadError">
      <FButton appearance="primary" icon="refresh" @click="app.boot()">تلاش دوباره</FButton>
    </FEmpty>
  </div>

  <div v-else class="boot sk">
    <FSkeleton :h="132" :r="8" />
    <FSkeleton :h="72" :r="8" /><FSkeleton :h="72" :r="8" /><FSkeleton :h="72" :r="8" />
  </div>

  <ToastHost />
</template>

<style scoped>
.boot { max-width: 640px; margin: 0 auto; padding: calc(var(--content-top) + var(--s-xxl)) var(--s-l); }
.boot.sk { display: flex; flex-direction: column; gap: var(--s-m); }
</style>
