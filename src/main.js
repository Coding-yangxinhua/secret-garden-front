import 'vant/lib/index.css'
import './assets/main.css'
import './assets/apple-card.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import Vant from 'vant'
import CuteIcon from '@/components/CuteIcon.vue'

const app = createApp(App)
app.component('cute-icon', CuteIcon)
const pinia = createPinia()

app.use(pinia)

app.use(Vant)

// Lazyload 指令需要单独进行注册
app.use(Vant.Lazyload)

app.use(router)

app.mount('#app')
