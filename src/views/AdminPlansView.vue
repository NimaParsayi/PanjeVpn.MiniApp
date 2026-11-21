<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Cell, Divider, List, Placeholder, Section, Skeleton } from 'telegram-ui-vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import Tag from '@/components/Tag.vue'
import TgEmoji from '@/components/TgEmoji.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { api, ApiError, type AdminPlan } from '@/api'
import { E } from '@/emoji/ids'
import { useApp } from '@/stores/app'
import { useUi } from '@/stores/ui'
import { fa, toman } from '@/utils/format'

const router = useRouter()
const app = useApp()
const ui = useUi()
if (!app.me?.isAdmin) router.replace('/')

const plans = ref<AdminPlan[]>([])
const loading = ref(true)

const tone = (p: AdminPlan) => (p.color === 'Success' ? 'success' : p.color === 'Danger' ? 'danger' : 'primary')
const icon = (p: AdminPlan) => (p.resellersOnly ? 'people' : p.minSize === 0 ? 'infinity' : p.color === 'Success' ? 'leaf' : 'flash')

onMounted(async () => {
  try { plans.value = await api.getAdminPlans() }
  catch (e) { ui.toast(e instanceof ApiError ? e.message : 'خطایی ناشناخته رخ داد', 'error') }
  finally { loading.value = false }
})
</script>

<template>
  <div class="screen">
    <PageTitle title="مدیریت پلن‌ها" :subtitle="plans.length ? `${fa(plans.length)} پلن` : undefined" back />
    <List>
      <Section v-if="plans.length">
        <template v-for="(p, i) in plans" :key="p.id">
          <Divider v-if="i" />
          <Cell multiline @click="router.push(`/admin/plans/${p.id}`)">
            <template #before><ToneIcon :icon="icon(p)" :tone="tone(p)" :size="44" :emoji="p.emojiId" /></template>
            {{ p.name }}
            <template #subtitle>
              <span class="meta">
                <Tag tone="neutral">{{ p.panel === 'sanaei' ? 'سنایی' : 'پاسارگارد' }}</Tag>
                <Tag v-if="p.resellersOnly" tone="info">نمایندگان</Tag>
                <Tag v-if="p.warning" tone="danger">ناقص</Tag>
              </span>
            </template>
            <template #description>{{ p.minSize === 0 ? 'نامحدود' : `${toman(p.pricePerGb)} / گیگ` }}</template>
            <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
          </Cell>
        </template>
      </Section>
      <Section v-else-if="loading"><Skeleton visible><div style="height: 200px" /></Skeleton></Section>
      <Placeholder v-else>
        <TgEmoji :id="E.panda" fallback="cart" :size="110" loop />
        <template #header>هنوز پلنی نساختی</template>
        <template #description>با دکمه‌ی پایین اولین پلن رو بساز.</template>
      </Placeholder>
    </List>

    <div class="action-bar">
      <Button stretched size="l" @click="router.push('/admin/plans/new')"><template #before><FIcon name="plus" :size="20" /></template>پلن جدید</Button>
    </div>
  </div>
</template>

<style scoped>
.meta { display: inline-flex; gap: 6px; }
.chev { color: var(--tgui-hint-color); }
</style>
