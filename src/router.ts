import { createRouter, createWebHashHistory } from 'vue-router'
import { setBackButton } from '@/telegram/webapp'

declare module 'vue-router' {
  interface RouteMeta { tab?: boolean; parent?: string }
}

export const router = createRouter({
  // Hash history works under any static host, which is what Telegram needs.
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue'), meta: { tab: true } },
    { path: '/buy', component: () => import('@/views/PlansView.vue'), meta: { tab: true } },
    { path: '/buy/:planId', component: () => import('@/views/ConfigureView.vue'), meta: { parent: '/buy' } },
    { path: '/services', component: () => import('@/views/ServicesView.vue'), meta: { tab: true } },
    { path: '/services/:id', component: () => import('@/views/ServiceView.vue'), meta: { parent: '/services' } },
    { path: '/services/:id/extend', component: () => import('@/views/ExtendView.vue'), meta: { parent: '/services' } },
    { path: '/wallet', component: () => import('@/views/WalletView.vue'), meta: { tab: true } },
    { path: '/wallet/history', component: () => import('@/views/HistoryView.vue'), meta: { parent: '/wallet' } },
    { path: '/wallet/deposit/:method(ton|stars)', component: () => import('@/views/DepositView.vue'), meta: { parent: '/wallet' } },
    { path: '/gift', component: () => import('@/views/GiftView.vue'), meta: { parent: '/' } },
    { path: '/admin', component: () => import('@/views/AdminHubView.vue'), meta: { parent: '/' } },
    { path: '/admin/stats', component: () => import('@/views/AdminStatsView.vue'), meta: { parent: '/admin' } },
    { path: '/admin/charge', component: () => import('@/views/AdminChargeView.vue'), meta: { parent: '/admin' } },
    { path: '/admin/services', component: () => import('@/views/AdminServicesView.vue'), meta: { parent: '/admin' } },
    { path: '/admin/broadcast', component: () => import('@/views/BroadcastView.vue'), meta: { parent: '/admin' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  setBackButton(!to.meta.tab, () => {
    if (window.history.state?.back) router.back()
    else router.replace(to.meta.parent ?? '/')
  })
})
