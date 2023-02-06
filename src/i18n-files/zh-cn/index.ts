import tasks from '@/i18n-files/zh-cn/elements/tasks'
import events from '@/i18n-files/zh-cn/elements/events'
import gateway from '@/i18n-files/zh-cn/elements/gateway'
import other from '@/i18n-files/zh-cn/elements/other'
import lint from '@/i18n-files/zh-cn/lint'

export default {
  elements: {
    ...other,
    ...events,
    ...gateway,
    ...tasks
  },
  ...lint
}
