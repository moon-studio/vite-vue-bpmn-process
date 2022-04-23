import { Translate } from 'diagram-js/lib/i18n/translate'
import zhCN from './zh-cn.json'

const customTranslate: Translate = (template, replacements) => {
  replacements = replacements || {}
  // Translate
  template = zhCN[template] || template

  // Replace
  return template.replace(/{([^}]+)}/g, function (_, key) {
    let str = replacements[key]
    if (zhCN[replacements[key]] !== null && zhCN[replacements[key]] !== undefined) {
      str = zhCN[replacements[key]]
    }
    return str || '{' + key + '}'
  })
}

export default {
  translate: ['value', customTranslate]
}
