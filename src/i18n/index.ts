import { createI18n } from 'vue-i18n'
import zh_CN from './zh_CN'
import en_US from './en_US'

export const defaultLang = 'zh_CN'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: defaultLang,
  messages: {
    zh_CN,
    en_US
  }
})

export default i18n
