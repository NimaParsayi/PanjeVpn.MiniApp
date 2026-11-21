import type { Api } from './types'
import { ApiError } from './types'
import { initData } from '@/telegram/webapp'

/**
 * Talks to a real backend. Every request carries Telegram's signed `initData`
 * so the server can verify the user (HMAC-SHA256 with the bot token).
 * Endpoints live in PanjeVPNBot/MiniApp/MiniAppEndpoints.cs.
 */
export function createHttpApi(base: string): Api {
  async function call<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<T> {
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
    claimTrial: (planId) => call('POST', `/plans/${planId}/trial`),
    extendService: ({ serviceId, ...rest }) => call('POST', `/services/${serviceId}/extend`, rest),
    startTonDeposit: (priceToman) => call('POST', '/deposits/ton', { priceToman }),
    checkDeposit: (id) => call('POST', `/deposits/${id}/check`),
    startCardDeposit: (priceToman) => call('POST', '/deposits/card', { priceToman }),
    startStarsDeposit: (priceToman) => call('POST', '/deposits/stars', { priceToman }),
    createGift: (amount) => call('POST', '/gifts', { amount }),
    sendBulkMessage: (text) => call('POST', '/admin/bulk-message', { text }),
    async getLogo() {
      try {
        const res = await fetch(`${base.replace(/\/$/, '')}/logo`, { headers: { Authorization: `tma ${initData}` } })
        return res.ok ? await res.blob() : null
      } catch {
        return null
      }
    },
    getHistory: (filter, page) => call('GET', `/history?filter=${filter}&page=${page}`),
    getAdminStats: () => call('GET', '/admin/stats'),
    lookupUser: (q) => call('GET', `/admin/users/lookup?q=${encodeURIComponent(q)}`),
    searchUsers: (q) => call('GET', `/admin/users/search?q=${encodeURIComponent(q)}`),
    adminCharge: (input) => call('POST', '/admin/charge', input),
    getAdminServices: (page, q) => call('GET', `/admin/services?page=${page}&q=${encodeURIComponent(q)}`),
    getAdmins: () => call('GET', '/admin/admins'),
    addAdmin: (telegramId) => call('POST', '/admin/admins', { telegramId }),
    removeAdmin: (telegramId) => call('DELETE', `/admin/admins/${telegramId}`),
    getBackups: () => call('GET', '/admin/backups'),
    createBackup: () => call('POST', '/admin/backups'),
    sendBackup: (name) => call('POST', `/admin/backups/${encodeURIComponent(name)}/send`),
    getAdminSettings: () => call('GET', '/admin/settings'),
    async setAdminSetting(key, value) { await call('PUT', `/admin/settings/${encodeURIComponent(key)}`, { value }) },
    getAdminPlans: () => call('GET', '/admin/plans'),
    saveAdminPlan: (id, input) => (id ? call('PUT', `/admin/plans/${id}`, input) : call('POST', '/admin/plans', input)),
    async deleteAdminPlan(id) { await call('DELETE', `/admin/plans/${id}`) },
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
