import type { Plan } from '@/api/types'

/** Same formulas as the bot: price × max(size,1) × dayMultiplier^daysIndex */
export const isUnlimited = (p: Plan) => p.minSize === 0

export function totalPrice(p: Plan, size: number, daysIndex: number): number {
  return Math.round(p.pricePerGb * (size >= 1 ? size : 1) * Math.pow(p.dayMultiplier, daysIndex))
}

export function pricePerGb(p: Plan, daysIndex: number): number {
  return Math.round(p.pricePerGb * Math.pow(p.dayMultiplier, daysIndex))
}

export const nextSize = (p: Plan, s: number) => (p.sizeMultiplication === -1 ? s + 1 : Math.round(s * p.sizeMultiplication))
export const prevSize = (p: Plan, s: number) => (p.sizeMultiplication === -1 ? s - 1 : Math.floor(s / p.sizeMultiplication))

export const canIncrease = (p: Plan, s: number) => p.maxSize === -1 || nextSize(p, s) <= p.maxSize
export const canDecrease = (p: Plan, s: number) => prevSize(p, s) >= p.minSize
