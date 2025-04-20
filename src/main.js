import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/main.css'

// 根据环境变量决定是否使用 mock
async function setupMockServiceWorker() {
    
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        const { worker } = await import('./mocks/browser')
        return worker.start({
            onUnhandledRequest: 'bypass',
        })
    }
}


await setupMockServiceWorker()
const app = createApp(App)
app.use(ElementPlus)

app.use(createPinia())
app.use(router)
app.mount('#app')
console.log('Environment variables:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK
})