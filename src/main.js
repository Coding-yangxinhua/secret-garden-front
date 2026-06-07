import './assets/main.css'
import 'vant/lib/index.css';

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


import Vant from 'vant';


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

app.use(Vant)

// Lazyload 指令需要单独进行注册
app.use(Vant.Lazyload);

app.use(router)

app.mount('#app')
