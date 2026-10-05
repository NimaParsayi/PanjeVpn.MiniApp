import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    allowedHosts: true,
    // Same-origin /miniapp calls reach the ASP.NET backend during development.
    proxy: { '/miniapp': { target: env.VITE_PROXY_TARGET || 'http://localhost:5135', changeOrigin: true } },
  },
  }
})
