import { Translate } from 'diagram-js/lib/i18n/translate'
import zhCN from './zh-cn'

const customTranslate: Translate = (template, replacements?: Record<string, string>) => {
  const rm = replacements || zhCN

  // Replace
  return template.replace(/{([^}]+)}/g, function (_, key) {
    return rm[key] || '{' + key + '}'
  })
}

export default {
  translate: ['value', customTranslate]
}
