import { createHttpApi } from './http'
import { mockApi } from './mock'
import type { Api } from './types'

/** Demo data is opt-in (`VITE_USE_MOCK=true`); otherwise talk to the real backend. */
export const isDemo = import.meta.env.VITE_USE_MOCK === 'true'
const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/miniapp'

export const api: Api = isDemo ? mockApi : createHttpApi(base)
export * from './types'
