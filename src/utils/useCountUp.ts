import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/** Animates a number towards `source` (ease-out). */
export function useCountUp(source: Ref<number>, ms = 900) {
  const shown = ref(0)
  let raf = 0
  const run = (to: number) => {
    cancelAnimationFrame(raf)
    const from = shown.value
    if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) return void (shown.value = to)
    const t0 = performance.now()
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms)
      shown.value = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 4)))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  }
  watch(source, run, { immediate: true })
  onBeforeUnmount(() => cancelAnimationFrame(raf))
  return shown
}
