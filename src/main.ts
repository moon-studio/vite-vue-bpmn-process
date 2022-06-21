import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.js'

import './styles/index.scss'
import EventEmitter from '@/utils/EventEmitter'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.mount('#app')

app.config.globalProperties.$emitter = EventEmitter
