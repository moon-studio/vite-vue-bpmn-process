import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.js'

import './styles/index.scss'
import EventEmitter from '@/utils/EventEmitter'
import { createDiscreteApi } from 'naive-ui'

const { message, notification, dialog, loadingBar } = createDiscreteApi([
  'message',
  'dialog',
  'notification',
  'loadingBar'
])

window.__messageBox = message

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.mount('#app')

app.config.globalProperties.$emitter = EventEmitter
