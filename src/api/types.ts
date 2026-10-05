export type Tone = 'success' | 'primary' | 'danger'

export interface Me {
  telegramId: number
  username?: string
  displayName: string
  wallet: number // Toman
  isAdmin: boolean
  isReseller: boolean
  resellerTitle?: string
}

export interface Plan {
  id: string
  name: string
  icon: string // icon key
  tone: Tone
  description: string
  pricePerGb: number // Toman
  days: number[]
  dayMultiplier: number // price × multiplier^daysIndex
  minSize: number // 0 ⇒ unlimited plan
  maxSize: number // -1 ⇒ no upper bound
  sizeMultiplication: number // -1 ⇒ step by 1, otherwise ×N
  resellersOnly: boolean
  /** Telegram custom-emoji id stored on the plan (the same icon the bot shows). */
  emojiId?: string | null
}

export interface UserService {
  id: string
  name: string
  planId: string
  planName: string
  icon: string
  tone: Tone
  usedGb: number
  totalGb: number // 0 ⇒ unlimited
  expireAt: string // ISO
  lastOnlineAt: string | null
  subscriptionUrl: string
  priceAtTime: number
  createdAt: string
  /** The panel could not be reached, so usage/expiry are unknown. */
  unavailable?: boolean
  emojiId?: string | null
}

export interface CreateServiceInput { planId: string; size: number; daysIndex: number; name: string }
export interface ExtendServiceInput { serviceId: string; size: number; daysIndex: number }

export interface TonDeposit {
  transactionId: string
  priceToman: number
  priceTon: number
  walletAddress: string
  memo: string
  expiresAt: string
}
export interface StarsDeposit { transactionId: string; invoiceLink: string; priceToman: number; priceStars: number }
export interface Gift { id: string; amount: number; link: string }
export interface BulkResult { total: number; success: number; failed: number }

export interface Api {
  getMe(): Promise<Me>
  getPlans(): Promise<Plan[]>
  getServices(): Promise<UserService[]>
  getService(id: string): Promise<UserService>
  createService(input: CreateServiceInput): Promise<UserService>
  extendService(input: ExtendServiceInput): Promise<UserService>
  startTonDeposit(priceToman: number): Promise<TonDeposit>
  /** True once the deposit has been credited to the wallet (TON: checks the chain; Stars: waits for the bot webhook). */
  checkDeposit(transactionId: string): Promise<boolean>
  startStarsDeposit(priceToman: number): Promise<StarsDeposit>
  createGift(amount: number): Promise<Gift>
  sendBulkMessage(text: string): Promise<BulkResult>
  /** Raw .tgs bytes (gzipped Lottie) of a Telegram custom emoji, or null when unavailable. */
  getEmoji(id: string): Promise<ArrayBuffer | null>
}

export class ApiError extends Error {}
