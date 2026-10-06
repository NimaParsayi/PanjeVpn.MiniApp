const nf = new Intl.NumberFormat('fa-IR')
const nf1 = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 })
const df = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' })

/** Persian/Arabic digits → ASCII, so numbers typed on a Persian keyboard parse. */
export const asciiDigits = (s: string) => s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

/** ۱۲۳: Latin digits → Persian, for text the user is typing. */
export const faDigits = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])

const nfCompact = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 })
/** Short Toman amounts for buttons: ۲۰۰ هزار, ۱ میلیون, ۱٫۵ میلیون (never "۱٬۰۰۰ هزار"). */
export function compactToman(n: number): string {
  if (n >= 1_000_000) return `${nfCompact.format(n / 1_000_000)} میلیون`
  if (n >= 1_000) return `${nfCompact.format(n / 1_000)} هزار`
  return nfCompact.format(n)
}

const tf = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })
export const timeOfDay = (iso: string) => tf.format(new Date(iso))

/** "امروز", "دیروز", else the Persian date. */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((startOf(now) - startOf(d)) / 864e5)
  return diff === 0 ? 'امروز' : diff === 1 ? 'دیروز' : df.format(d)
}

export const fa = (n: number) => nf.format(n)
export const faDecimal = (n: number) => nf1.format(n)
export const toman = (n: number) => `${nf.format(Math.round(n))} تومان`
export const gb = (n: number) => `${nf1.format(n)} گیگابایت`
export const date = (iso: string) => df.format(new Date(iso))

/** "۳ روز و ۴ ساعت" for a future moment, or "منقضی شده" */
export function remaining(iso: string, now = Date.now()): string {
  const ms = new Date(iso).getTime() - now
  if (ms <= 0) return 'منقضی شده'
  const d = Math.floor(ms / 864e5)
  const h = Math.floor((ms % 864e5) / 36e5)
  const m = Math.floor((ms % 36e5) / 6e4)
  if (d > 0) return h > 0 ? `${fa(d)} روز و ${fa(h)} ساعت` : `${fa(d)} روز`
  if (h > 0) return `${fa(h)} ساعت و ${fa(m)} دقیقه`
  return `${fa(Math.max(m, 1))} دقیقه`
}

/** One unit only ("۱۷ روز", "۵ ساعت"), for tight list rows. */
export function remainingShort(iso: string, now = Date.now()): string {
  const ms = new Date(iso).getTime() - now
  if (ms <= 0) return 'منقضی شده'
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4)
  return d > 0 ? `${fa(d)} روز` : h > 0 ? `${fa(h)} ساعت` : `${fa(Math.max(m, 1))} دقیقه`
}

export const daysLeft = (iso: string, now = Date.now()) => Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 864e5))

/** "۲ ساعت پیش" */
export function ago(iso: string | null, now = Date.now()): string {
  if (!iso) return '—'
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'همین الان'
  const m = Math.floor(s / 60)
  if (m < 60) return `${fa(m)} دقیقه پیش`
  const h = Math.floor(m / 60)
  if (h < 24) return `${fa(h)} ساعت پیش`
  return `${fa(Math.floor(h / 24))} روز پیش`
}

export const countdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function shortAddress(a: string) {
  return a.length > 18 ? `${a.slice(0, 8)}…${a.slice(-8)}` : a
}
