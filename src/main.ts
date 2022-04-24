import { createApp } from 'vue'
import App from './App.js'

import './styles/index.scss'
import EventEmitter from '@/utils/EventEmitter'

const app = createApp(App)

app.mount('#app')

app.config.globalProperties.$emitter = EventEmitter.instance
