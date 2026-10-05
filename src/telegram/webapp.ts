/* A thin, typed wrapper around Telegram.WebApp that degrades gracefully in a normal browser. */

import { applyPalette, presets, type ThemeParams } from './palette'

interface TgWebApp {
  initData: string
  themeParams: ThemeParams
  initDataUnsafe: { user?: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string } }
  colorScheme: 'light' | 'dark'
  isVersionAtLeast(v: string): boolean
  ready(): void
  expand(): void
  close(): void
  disableVerticalSwipes?(): void
  platform?: string
  requestFullscreen?(): void
  isFullscreen?: boolean
  enableClosingConfirmation?(): void
  setHeaderColor?(c: string): void
  setBackgroundColor?(c: string): void
  onEvent(e: string, cb: () => void): void
  openLink(url: string): void
  openTelegramLink(url: string): void
  openInvoice(url: string, cb?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void): void
  showAlert?(msg: string, cb?: () => void): void
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void }
  HapticFeedback: {
    impactOccurred(s: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(t: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
}

declare global {
  interface Window { Telegram?: { WebApp?: TgWebApp } }
}

const tg = window.Telegram?.WebApp
export const isTelegram = !!tg?.initData

export const initData = tg?.initData ?? ''
export const tgUser = tg?.initDataUnsafe?.user

/** telegram-ui looks different on iOS (inset, rounded) and elsewhere ("base", Material-like). */
export const uiPlatform: 'ios' | 'base' = (() => {
  const q = new URLSearchParams(location.search).get('platform')
  if (!isTelegram && (q === 'ios' || q === 'base')) return q
  // Telegram's current design (inset rounded sections, floating glass bar) is the same on iOS and Android.
  return 'ios'
})()

let presetIndex = 0
export const paletteName = () => presets[presetIndex].name

function applyTheme() {
  const inTg = !!tg && isTelegram
  const r = inTg
    ? applyPalette(tg!.themeParams ?? {}, tg!.colorScheme)
    : applyPalette(presets[presetIndex].params, undefined)
  try {
    tg?.setHeaderColor?.(r.canvas)
    tg?.setBackgroundColor?.(r.canvas)
  } catch { /* older clients */ }
}

/** Browser preview only: cycle through sample palettes to see how Telegram themes will look. */
export function cyclePalette() {
  presetIndex = (presetIndex + 1) % presets.length
  applyTheme()
  return paletteName()
}

export function initTelegram() {
  // Start from the system scheme when we're not inside Telegram.
  if (!isTelegram && window.matchMedia('(prefers-color-scheme: dark)').matches) presetIndex = 1
  applyTheme()
  if (!tg) return
  tg.ready()
  tg.expand()
  // Full-screen (Bot API 8.0+) hides Telegram's own header. Phones only: on desktop it would maximise the window.
  if (['ios', 'android'].includes(tg.platform ?? '') && tg.isVersionAtLeast('8.0')) {
    try { tg.requestFullscreen?.() } catch { /* not allowed / unsupported */ }
  }
  tg.disableVerticalSwipes?.()
  tg.onEvent('themeChanged', applyTheme)
}

/* Haptics */
export const haptic = {
  tap: () => tg?.HapticFeedback?.impactOccurred('light'),
  select: () => tg?.HapticFeedback?.selectionChanged(),
  success: () => tg?.HapticFeedback?.notificationOccurred('success'),
  error: () => tg?.HapticFeedback?.notificationOccurred('error'),
  warning: () => tg?.HapticFeedback?.notificationOccurred('warning'),
}

/* Native back button, driven by the router */
let backHandler: (() => void) | null = null
export function setBackButton(visible: boolean, handler?: () => void) {
  if (!tg?.BackButton) return
  if (backHandler) tg.BackButton.offClick(backHandler)
  backHandler = null
  if (visible && handler) {
    backHandler = handler
    tg.BackButton.onClick(handler)
    tg.BackButton.show()
  } else tg.BackButton.hide()
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

export function openLink(url: string) {
  if (/^https?:\/\/t\.me\//.test(url) && tg?.openTelegramLink) tg.openTelegramLink(url)
  else if (tg?.openLink) tg.openLink(url)
  else window.open(url, '_blank', 'noopener')
}

export function shareLink(url: string, text = '') {
  openLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)
}

export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending'
export function openInvoice(url: string): Promise<InvoiceStatus> {
  return new Promise((resolve) => {
    if (tg?.openInvoice && isTelegram) tg.openInvoice(url, resolve)
    else setTimeout(() => resolve('paid'), 1200) // browser demo
  })
}
