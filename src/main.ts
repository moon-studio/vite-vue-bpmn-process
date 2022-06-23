import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.js'

import './styles/index.scss'

import {
  createDiscreteApi,
  create,
  NColorPicker,
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NButton,
  NButtonGroup,
  NTag,
  NCollapse,
  NCollapseItem,
  NDataTable,
  NPopover,
  NDrawer,
  NDrawerContent,
  NModal,
  NCode,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NRadio,
  NRadioGroup,
  NCheckbox,
  NCheckboxGroup,
  NSwitch
} from 'naive-ui'

const naive = create({
  components: [
    NColorPicker,
    NConfigProvider,
    NMessageProvider,
    NDialogProvider,
    NButton,
    NButtonGroup,
    NTag,
    NCollapse,
    NCollapseItem,
    NDataTable,
    NPopover,
    NDrawer,
    NDrawerContent,
    NModal,
    NCode,
    NForm,
    NFormItem,
    NInput,
    NInputNumber,
    NRadio,
    NRadioGroup,
    NCheckbox,
    NCheckboxGroup,
    NSwitch
  ]
})
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
app.use(naive)

app.mount('#app')
