import { api } from '@/api'

/**
 * Telegram custom emoji are .tgs files: gzipped Lottie JSON. Fetch once per id (the server also caches),
 * inflate with the browser's DecompressionStream, and load the Lottie runtime only when the first one is needed.
 */
const animations = new Map<string, Promise<object | null>>()
let lottie: Promise<typeof import('lottie-web/build/player/lottie_light').default> | null = null

export const loadLottie = () => (lottie ??= import('lottie-web/build/player/lottie_light').then((m) => m.default))

export const canPlayEmoji = typeof DecompressionStream !== 'undefined'

export function loadEmoji(id: string): Promise<object | null> {
  if (!canPlayEmoji) return Promise.resolve(null)
  let p = animations.get(id)
  if (!p) {
    p = (async () => {
      const bytes = await api.getEmoji(id)
      if (!bytes) return null
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
      return (await new Response(stream).json()) as object
    })().catch(() => null)
    animations.set(id, p)
    // Don't remember misses, so a flaky network can recover on the next render.
    p.then((v) => { if (!v) animations.delete(id) })
  }
  return p
}
