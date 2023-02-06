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
  NSelect,
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
    NSelect,
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

import LucideIcon from '@/components/common/LucideIcon.vue'
import EditItem from '@/components/common/EditItem.vue'
import CollapseTitle from '@/components/common/CollapseTitle.vue'

import 'virtual:svg-icons-register'

import { createI18n } from 'vue-i18n'

const app = createApp(App)

const pinia = createPinia()

const i18n = createI18n({
  // something vue-i18n options here ...
})

app.use(i18n)
app.use(pinia)
app.use(naive)
app.component('LucideIcon', LucideIcon)
app.component('EditItem', EditItem)
app.component('CollapseTitle', CollapseTitle)

app.mount('#app')
