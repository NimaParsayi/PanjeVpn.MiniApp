/** Tiny canvas confetti, coloured from the user's Telegram palette. */
export function confetti(count = 90) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const cs = getComputedStyle(document.documentElement)
  const colors = ['--p-button', '--p-link', '--brand-2', '--success-solid', '--warning-solid', '--p-destructive']
    .map((v) => cs.getPropertyValue(v).trim())
    .filter(Boolean)

  const canvas = document.createElement('canvas')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = (canvas.width = innerWidth * dpr)
  const h = (canvas.height = innerHeight * dpr)
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '200' })
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!

  const parts = Array.from({ length: count }, (_, i) => {
    const fromLeft = i % 2 === 0
    const angle = (fromLeft ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.9
    const speed = (9 + Math.random() * 9) * dpr
    return {
      x: (fromLeft ? 0.1 : 0.9) * w, y: h * 0.78,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      size: (5 + Math.random() * 6) * dpr, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)], round: Math.random() > 0.6,
    }
  })

  const start = performance.now()
  const tick = (t: number) => {
    const life = (t - start) / 1900
    ctx.clearRect(0, 0, w, h)
    for (const p of parts) {
      p.vy += 0.35 * dpr; p.vx *= 0.992; p.x += p.vx; p.y += p.vy; p.rot += p.vr
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, life - 0.6) / 0.4)
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 7); ctx.fill() }
      else ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6)
      ctx.restore()
    }
    if (life < 1) requestAnimationFrame(tick)
    else canvas.remove()
  }
  requestAnimationFrame(tick)
}
