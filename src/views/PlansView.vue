<script setup lang="ts">
import TgEmoji from '@/components/TgEmoji.vue'
import { E } from '@/emoji/ids'
import { useRouter } from 'vue-router'
import { Cell, Divider, List, Placeholder, Section } from 'telegram-ui-vue'
import Tag from '@/components/Tag.vue'
import PageTitle from '@/components/PageTitle.vue'
import FIcon from '@/components/FIcon.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { useApp } from '@/stores/app'
import { fa, toman } from '@/utils/format'
import { isUnlimited, pricePerGb, totalPrice } from '@/utils/pricing'

const app = useApp()
const router = useRouter()
</script>

<template>
  <div class="screen with-tabs">
    <PageTitle title="خرید سرویس" subtitle="سرویس مدنظرت رو انتخاب کن" />
    <List>
      <Section v-if="app.plans.length">
        <template v-for="(p, i) in app.plans" :key="p.id">
          <Divider v-if="i" />
          <Cell multiline @click="router.push(`/buy/${p.id}`)">
            <template #before><ToneIcon :icon="p.icon" :tone="p.tone" :size="48" :emoji="p.emojiId" /></template>
            {{ p.name }}
            <template #subtitle>
              <span class="num">{{ isUnlimited(p) ? `از ${toman(totalPrice(p, 0, 0))}` : `هر گیگ از ${toman(pricePerGb(p, 0))}` }}</span>
            </template>
            <template #description>
              {{ p.description }}
              <span class="chips">
                <Tag tone="neutral">{{ fa(p.days[0]) }} تا {{ fa(p.days[p.days.length - 1]) }} روز</Tag>
                <Tag v-if="p.trial?.status === 'available'" tone="success" dot>تست رایگان</Tag>
                <Tag :tone="isUnlimited(p) ? 'success' : 'neutral'">{{ isUnlimited(p) ? 'حجم نامحدود' : `از ${fa(p.minSize)} گیگ` }}</Tag>
              </span>
            </template>
            <template #after><FIcon name="chevronEnd" :size="18" class="chev" /></template>
          </Cell>
        </template>
      </Section>
      <Placeholder v-else>
        <TgEmoji :id="E.panda" fallback="cart" :size="120" loop />
        <template #header>پلنی در دسترس نیست</template>
        <template #description>چند لحظه‌ی دیگه دوباره سر بزن.</template>
      </Placeholder>
    </List>
  </div>
</template>

<style scoped>
.chev { color: var(--tgui-hint-color); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
</style>
