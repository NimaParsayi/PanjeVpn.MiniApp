import type { Api, Gift, Me, Plan, UserService } from './types'
import { ApiError } from './types'
import { totalPrice } from '@/utils/pricing'
import { tgUser } from '@/telegram/webapp'

const wait = <T>(v: T, ms = 380) => new Promise<T>((r) => setTimeout(() => r(v), ms))
const rid = () => Math.random().toString(36).slice(2, 8)
const hoursAgo = (h: number) => new Date(Date.now() - h * 36e5).toISOString()
const daysAhead = (d: number) => new Date(Date.now() + d * 864e5).toISOString()

const me: Me = {
  telegramId: tgUser?.id ?? 123456789,
  username: tgUser?.username ?? 'panje_user',
  displayName: tgUser?.first_name ?? 'کاربر پنجه',
  wallet: 1_250_000,
  isAdmin: new URLSearchParams(location.search).has('admin'),
  isReseller: new URLSearchParams(location.search).has('reseller'),
  resellerTitle: 'Nima',
}

const plans: Plan[] = [
  {
    id: 'p-fast', name: 'پنجه پرسرعت', icon: 'flash', tone: 'primary',
    description: 'مناسب گیم، تماس تصویری و استریم؛ کمترین پینگ و بیشترین پایداری.',
    pricePerGb: 9000, days: [7, 14, 30, 60, 90], dayMultiplier: 1.5,
    minSize: 5, maxSize: 200, sizeMultiplication: 2, resellersOnly: false,
  },
  {
    id: 'p-eco', name: 'پنجه اقتصادی', icon: 'leaf', tone: 'success',
    description: 'گزینه‌ی به‌صرفه برای مصرف روزمره و وب‌گردی با قیمت هر گیگ پایین‌تر.',
    pricePerGb: 5500, days: [14, 30, 60, 90], dayMultiplier: 1.4,
    minSize: 10, maxSize: 300, sizeMultiplication: -1, resellersOnly: false,
  },
  {
    id: 'p-unlimited', name: 'پنجه نامحدود', icon: 'infinity', tone: 'danger',
    description: 'بدون محدودیت حجم برای یک کاربر؛ قیمت ثابت بر اساس مدت زمان.',
    pricePerGb: 240000, days: [30, 60, 90], dayMultiplier: 1.8,
    minSize: 0, maxSize: 0, sizeMultiplication: -1, resellersOnly: false,
  },
  {
    id: 'p-reseller', name: 'پکیج نماینده', icon: 'people', tone: 'primary',
    description: 'تعرفه‌ی ویژه‌ی نماینده‌ها برای فروش مجدد.',
    pricePerGb: 3500, days: [30, 60, 90], dayMultiplier: 1.3,
    minSize: 20, maxSize: -1, sizeMultiplication: 2, resellersOnly: true,
  },
]

const services: UserService[] = [
  {
    id: 's1', name: `${me.telegramId}-aB3xK`, planId: 'p-fast', planName: 'پنجه پرسرعت', icon: 'flash', tone: 'primary',
    usedGb: 18.4, totalGb: 40, expireAt: daysAhead(17.3), lastOnlineAt: hoursAgo(0.2),
    subscriptionUrl: 'https://sub.panjevpn.example/sub/aB3xKq9Lm2Zt8W', priceAtTime: 540000, createdAt: hoursAgo(300),
  },
  {
    id: 's2', name: `${me.telegramId}-laptop`, planId: 'p-eco', planName: 'پنجه اقتصادی', icon: 'leaf', tone: 'success',
    usedGb: 47.9, totalGb: 50, expireAt: daysAhead(2.1), lastOnlineAt: hoursAgo(5),
    subscriptionUrl: 'https://sub.panjevpn.example/sub/laptopZ81nQw3Er5', priceAtTime: 390000, createdAt: hoursAgo(700),
  },
  {
    id: 's3', name: `${me.telegramId}-family`, planId: 'p-unlimited', planName: 'پنجه نامحدود', icon: 'infinity', tone: 'danger',
    usedGb: 212.6, totalGb: 0, expireAt: daysAhead(41), lastOnlineAt: hoursAgo(26),
    subscriptionUrl: 'https://sub.panjevpn.example/sub/familyP0oIu7yTr4', priceAtTime: 432000, createdAt: hoursAgo(200),
  },
]

const deposits = new Map<string, { amount: number; checks: number; done: boolean; stars?: boolean }>()

const find = (id: string) => {
  const s = services.find((x) => x.id === id)
  if (!s) throw new ApiError('سرویس پیدا نشد')
  return s
}
const planOf = (id: string) => {
  const p = plans.find((x) => x.id === id)
  if (!p) throw new ApiError('پلن پیدا نشد')
  return p
}
const charge = (amount: number) => {
  if (me.wallet < amount) throw new ApiError('موجودی حسابت کافی نیست، لطفاً اول کیف پولتو شارژ کن.')
  me.wallet -= amount
}

export const mockApi: Api = {
  getMe: () => wait({ ...me }, 250),
  getPlans: () => wait(plans.filter((p) => p.resellersOnly === me.isReseller)),
  getServices: () => wait([...services].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  getService: (id) => wait({ ...find(id) }, 300),

  async createService({ planId, size, daysIndex, name }) {
    const p = planOf(planId)
    const price = totalPrice(p, size, daysIndex)
    charge(price)
    const s: UserService = {
      id: `s${rid()}`, name: `${me.telegramId}-${name}`, planId: p.id, planName: p.name, icon: p.icon, tone: p.tone,
      usedGb: 0, totalGb: size, expireAt: daysAhead(p.days[daysIndex]), lastOnlineAt: null,
      subscriptionUrl: `https://sub.panjevpn.example/sub/${rid()}${rid()}${rid()}`,
      priceAtTime: price, createdAt: new Date().toISOString(),
    }
    services.unshift(s)
    return wait({ ...s }, 900)
  },

  async extendService({ serviceId, size, daysIndex }) {
    const s = find(serviceId)
    const p = planOf(s.planId)
    const price = totalPrice(p, size, daysIndex)
    charge(price)
    s.totalGb += size
    s.expireAt = daysAhead(p.days[daysIndex]) // time restarts from now; data is added (same as the bot)
    s.priceAtTime = price
    return wait({ ...s }, 900)
  },

  async startTonDeposit(priceToman) {
    const id = `t${rid()}`
    deposits.set(id, { amount: priceToman, checks: 0, done: false })
    return wait({
      transactionId: id,
      priceToman,
      priceTon: Math.round((priceToman / 168_000) * 1e5) / 1e5,
      walletAddress: 'UQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG',
      memo: rid().toUpperCase() + rid().toUpperCase() + rid().toUpperCase(),
      expiresAt: new Date(Date.now() + 30 * 6e4).toISOString(),
    })
  },

  async checkDeposit(id) {
    const d = deposits.get(id)
    if (!d) throw new ApiError('تراکنش پیدا نشد')
    d.checks++
    await wait(null, 1100)
    if (d.checks < 2 && !d.stars) return false // demo: a TON payment "arrives" on the 2nd check
    if (!d.done) { d.done = true; me.wallet += d.amount }
    return true
  },

  async startStarsDeposit(priceToman) {
    const id = `t${rid()}`
    deposits.set(id, { amount: priceToman, checks: 0, done: false, stars: true })
    return wait({
      transactionId: id,
      invoiceLink: `https://t.me/$demo-${id}`,
      priceToman,
      priceStars: Math.round(priceToman / (101_000 * 0.0165)),
    })
  },

  async createGift(amount) {
    if (amount <= 0) throw new ApiError('مبلغ پنجه‌گیفت نمی‌تونه صفر باشه!')
    charge(amount)
    const gift: Gift = { id: rid(), amount, link: `https://t.me/PanjeVPNBot?start=activeGift_${crypto.randomUUID()}` }
    return wait(gift, 700)
  },

  getEmoji: async () => null, // no bot in demo mode → components fall back to vector icons
  getLogo: async () => null,

  getAdminStats: () => wait({
    users: 1280, usersLast7Days: 64, services: 912, servicesLast7Days: 41, walletTotal: 38_450_000,
    depositsTotal: 412_000_000, depositsLast30Days: 96_500_000, giftsUnused: 7, giftsUnusedAmount: 1_450_000,
  }),
  async lookupUser(q) {
    const key = q.trim().replace(/^@/, '')
    if (!key || key === 'nobody') throw new ApiError('کاربری با این مشخصات پیدا نشد (باید قبلاً ربات رو استارت کرده باشه).')
    return wait({ telegramId: /^\d+$/.test(key) ? Number(key) : 555000111, username: /^\d+$/.test(key) ? null : key, wallet: 120_000, services: 2 })
  },
  async adminCharge({ telegramId, username, amount }) {
    if (amount <= 0) throw new ApiError('مبلغ باید بیشتر از صفر باشه.')
    return wait({ telegramId: telegramId ?? 555000111, username: username ?? null, wallet: 120_000 + amount, services: 2 }, 700)
  },
  getAdminServices: (page, q) => {
    const all = Array.from({ length: 47 }, (_, i) => ({
      id: `a${i}`, name: `${555000000 + (i % 9)}-demo${String(i).padStart(2, '0')}`, planName: plans[i % 3].name,
      tone: plans[i % 3].tone, icon: plans[i % 3].icon, emojiId: null, ownerTelegramId: 555000000 + (i % 9),
      ownerUsername: i % 2 ? `user_${i % 9}` : null, priceAtTime: 90_000 + i * 1_500, createdAt: hoursAgo(i * 9),
    })).filter((s) => !q.trim() || `${s.name} ${s.ownerUsername ?? ''} ${s.ownerTelegramId}`.toLowerCase().includes(q.trim().replace(/^@/, '').toLowerCase()))
    return wait({ items: all.slice((page - 1) * 20, page * 20), total: all.length, page, pageSize: 20 })
  },

  sendBulkMessage: async () => wait({ total: 1280, success: 1243, failed: 37 }, 1800),
}
