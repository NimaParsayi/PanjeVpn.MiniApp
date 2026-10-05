import type { Api } from './types'
import { ApiError } from './types'
import { initData } from '@/telegram/webapp'

/**
 * Talks to a real backend. Every request carries Telegram's signed `initData`
 * so the server can verify the user (HMAC-SHA256 with the bot token).
 * Endpoints live in PanjeVPNBot/MiniApp/MiniAppEndpoints.cs.
 */
export function createHttpApi(base: string): Api {
  async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    let res: Response
    try {
      res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `tma ${initData}` },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new ApiError('اتصال به سرور برقرار نشد، اینترنتت رو چک کن.')
    }
    if (!res.ok) {
      let msg = 'خطایی ناشناخته رخ داد'
      try { msg = (await res.json()).message ?? msg } catch { /* ignore */ }
      throw new ApiError(msg)
    }
    return res.json()
  }

  return {
    getMe: () => call('GET', '/me'),
    getPlans: () => call('GET', '/plans'),
    getServices: () => call('GET', '/services'),
    getService: (id) => call('GET', `/services/${id}`),
    createService: (i) => call('POST', '/services', i),
    extendService: ({ serviceId, ...rest }) => call('POST', `/services/${serviceId}/extend`, rest),
    startTonDeposit: (priceToman) => call('POST', '/deposits/ton', { priceToman }),
    checkDeposit: async (id) => (await call<{ paid: boolean }>('POST', `/deposits/${id}/check`)).paid,
    startStarsDeposit: (priceToman) => call('POST', '/deposits/stars', { priceToman }),
    createGift: (amount) => call('POST', '/gifts', { amount }),
    sendBulkMessage: (text) => call('POST', '/admin/bulk-message', { text }),
    async getEmoji(id) {
      try {
        const res = await fetch(`${base.replace(/\/$/, '')}/emoji/${encodeURIComponent(id)}`, { headers: { Authorization: `tma ${initData}` } })
        return res.ok ? await res.arrayBuffer() : null
      } catch {
        return null
      }
    },
  }
}
