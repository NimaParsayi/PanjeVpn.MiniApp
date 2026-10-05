import { ref } from 'vue'

/**
 * Maps Telegram's `themeParams` onto our CSS custom properties (--p-*).
 * Everything else in tokens.css is derived from these with color-mix(), so any
 * user theme (built-in or custom) re-colours the whole app automatically.
 */
export type ThemeParams = Partial<Record<
  'bg_color' | 'secondary_bg_color' | 'section_bg_color' | 'text_color' | 'hint_color' | 'link_color' |
  'button_color' | 'button_text_color' | 'destructive_text_color' | 'accent_text_color' | 'header_bg_color',
  string
>>

const LIGHT: Required<ThemeParams> = {
  bg_color: '#ffffff', secondary_bg_color: '#f1f2f6', section_bg_color: '#ffffff', text_color: '#111418',
  hint_color: '#8a8f98', link_color: '#2481cc', button_color: '#3390ec', button_text_color: '#ffffff',
  destructive_text_color: '#e53935', accent_text_color: '#2481cc', header_bg_color: '#ffffff',
}
const DARK: Required<ThemeParams> = {
  bg_color: '#17212b', secondary_bg_color: '#0e1621', section_bg_color: '#1c2733', text_color: '#f5f7fa',
  hint_color: '#7d8b99', link_color: '#6ab3f3', button_color: '#5288c1', button_text_color: '#ffffff',
  destructive_text_color: '#ec3942', accent_text_color: '#6ab3f3', header_bg_color: '#17212b',
}

/** Sample palettes for previewing outside Telegram. */
export const presets: { name: string; params: ThemeParams }[] = [
  { name: 'تلگرام روشن', params: LIGHT },
  { name: 'تلگرام تیره', params: DARK },
  { name: 'رز', params: { bg_color: '#fffafc', secondary_bg_color: '#fdeef4', section_bg_color: '#ffffff', text_color: '#2a1220', hint_color: '#a07a8c', link_color: '#d6336c', accent_text_color: '#d6336c', button_color: '#e8508a', button_text_color: '#ffffff' } },
  { name: 'نعنا', params: { bg_color: '#0f201d', secondary_bg_color: '#081412', section_bg_color: '#15302b', text_color: '#e8fff9', hint_color: '#7fa89f', link_color: '#5eead4', accent_text_color: '#5eead4', button_color: '#2dd4a7', button_text_color: '#04211b', destructive_text_color: '#ff6b6b' } },
  { name: 'بنفش', params: { bg_color: '#1b1530', secondary_bg_color: '#110c21', section_bg_color: '#251c42', text_color: '#f3efff', hint_color: '#9486b8', link_color: '#b6a2ff', accent_text_color: '#b6a2ff', button_color: '#8b6cff', button_text_color: '#ffffff' } },
  { name: 'غروب', params: { bg_color: '#fffaf5', secondary_bg_color: '#ffefe0', section_bg_color: '#ffffff', text_color: '#2b1a0e', hint_color: '#a78b74', link_color: '#e0620f', accent_text_color: '#e0620f', button_color: '#ff7a2f', button_text_color: '#ffffff' } },
]

const lum = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 1
  const n = parseInt(m[1], 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Reactive so telegram-ui-vue's <AppRoot> can follow the user's light/dark scheme. */
export const isDark = ref(false)

export function applyPalette(params: ThemeParams, scheme?: 'light' | 'dark') {
  const dark = scheme ? scheme === 'dark' : lum(params.bg_color ?? LIGHT.bg_color) < 0.45
  const p = { ...(dark ? DARK : LIGHT), ...Object.fromEntries(Object.entries(params).filter(([, v]) => !!v)) } as Required<ThemeParams>
  const s = document.documentElement.style
  const set = (k: string, v: string) => s.setProperty(`--p-${k}`, v)
  set('bg', p.bg_color)
  set('secondary', p.secondary_bg_color)
  set('section', p.section_bg_color)
  set('text', p.text_color)
  set('hint', p.hint_color)
  set('link', p.accent_text_color || p.link_color)
  set('button', p.button_color)
  set('on-button', p.button_text_color)
  set('destructive', p.destructive_text_color)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  isDark.value = dark
  applyTguiTheme(p)
  return { dark, canvas: p.secondary_bg_color, header: p.bg_color }
}

/**
 * telegram-ui-vue hard-codes its --tgui-* colours per appearance instead of reading Telegram's theme,
 * so write the user's palette over them. `:root .app-root` outranks the library's `.app-root(--dark)` rules.
 */
function applyTguiTheme(p: Required<ThemeParams>) {
  const css = `:root .app-root, :root .app-root--dark {
    --tgui-bg-color: ${p.bg_color};
    --tgui-text-color: ${p.text_color};
    --tgui-hint-color: ${p.hint_color};
    --tgui-link-color: ${p.link_color};
    --tgui-button-color: ${p.button_color};
    --tgui-button-text-color: ${p.button_text_color};
    --tgui-secondary-bg-color: ${p.secondary_bg_color};
    --tgui-header-bg-color: ${p.header_bg_color};
    --tgui-accent-text-color: ${p.accent_text_color};
    --tgui-section-bg-color: ${p.section_bg_color};
    --tgui-section-header-text-color: ${p.hint_color};
    --tgui-subtitle-text-color: ${p.hint_color};
    --tgui-destructive-text-color: ${p.destructive_text_color};
    --tgui-card-bg-color: ${p.section_bg_color};
    --tgui-segmented-control-active-bg: ${p.section_bg_color};
    --tgui-divider: color-mix(in srgb, ${p.text_color} 10%, transparent);
    --tgui-outline: color-mix(in srgb, ${p.text_color} 12%, transparent);
    --tgui-secondary-fill: color-mix(in srgb, ${p.button_color} 10%, transparent);
    --tgui-destructive-background: color-mix(in srgb, ${p.destructive_text_color} 10%, transparent);
    --tgui-plain-background: color-mix(in srgb, ${p.text_color} 5%, transparent);
    --tgui-plain-foreground: color-mix(in srgb, ${p.text_color} 70%, transparent);
    --tgui-secondary-hint-color: color-mix(in srgb, ${p.hint_color} 75%, ${p.bg_color});
    --tgui-tertiary-bg-color: color-mix(in srgb, ${p.text_color} 4%, ${p.secondary_bg_color});
    --tgui-quaternary-bg-color: color-mix(in srgb, ${p.text_color} 6%, ${p.secondary_bg_color});
    --tgui-quartenary-bg-color: color-mix(in srgb, ${p.text_color} 6%, ${p.secondary_bg_color});
    --tgui-font-family: var(--font);
  }`
  let el = document.getElementById('tgui-theme') as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = 'tgui-theme'
    document.head.appendChild(el)
  }
  el.textContent = css
}
