<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import FCard from '@/components/FCard.vue'
import FIcon from '@/components/FIcon.vue'
import FBadge from '@/components/FBadge.vue'
import FEmpty from '@/components/FEmpty.vue'
import ToneIcon from '@/components/ToneIcon.vue'
import { useApp } from '@/stores/app'
import { fa, toman } from '@/utils/format'
import { isUnlimited, pricePerGb, totalPrice } from '@/utils/pricing'

const app = useApp()
</script>

<template>
  <div class="view">
    <PageHeader title="خرید سرویس" subtitle="سرویس مدنظرت رو انتخاب کن" />
    <main class="page">
      <FCard v-for="p in app.plans" :key="p.id" interactive padding="lg" @click="$router.push(`/buy/${p.id}`)">
        <div class="row head">
          <ToneIcon :icon="p.icon" :tone="p.tone" :size="44" />
          <div class="grow">
            <h3>{{ p.name }}</h3>
            <div class="price num">
              <template v-if="isUnlimited(p)">از <b>{{ toman(totalPrice(p, 0, 0)) }}</b></template>
              <template v-else>هر گیگ از <b>{{ toman(pricePerGb(p, 0)) }}</b></template>
            </div>
          </div>
          <FIcon name="chevronEnd" :size="20" class="chev" />
        </div>
        <p class="desc">{{ p.description }}</p>
        <div class="chips">
          <FBadge tone="brand"><FIcon name="calendar" :size="12" />{{ fa(p.days[0]) }} تا {{ fa(p.days[p.days.length - 1]) }} روز</FBadge>
          <FBadge v-if="isUnlimited(p)" tone="success"><FIcon name="infinity" :size="12" />حجم نامحدود</FBadge>
          <FBadge v-else tone="neutral"><FIcon name="chart" :size="12" />از {{ fa(p.minSize) }} گیگ</FBadge>
        </div>
      </FCard>
      <FEmpty v-if="!app.plans.length" icon="cart" title="پلنی در دسترس نیست" text="چند لحظه‌ی دیگه دوباره سر بزن." />
    </main>
  </div>
</template>

<style scoped>
.head { align-items: flex-start; }
h3 { font: var(--t-subtitle2); }
.price { font: var(--t-caption); color: var(--fg-3); margin-top: 2px; }
.price b { color: var(--fg-brand); font-size: 13px; }
.chev { color: var(--fg-4); margin-top: var(--s-s); }
.desc { margin-top: var(--s-m); color: var(--fg-2); font-size: 13px; line-height: 21px; }
.chips { display: flex; flex-wrap: wrap; gap: var(--s-s); margin-top: var(--s-m); }
</style>
