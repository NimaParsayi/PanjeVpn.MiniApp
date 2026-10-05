import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { initTelegram } from './telegram/webapp'
import './styles/base.css'
import './styles/glass.css'

initTelegram()
createApp(App).use(createPinia()).use(router).mount('#app')
