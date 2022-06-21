import tasks from '@/additional-modules/Translate/zh-cn/tasks'
import events from '@/additional-modules/Translate/zh-cn/events'
import gateway from '@/additional-modules/Translate/zh-cn/gateway'
import lint from '@/additional-modules/Translate/zh-cn/lint'
import other from '@/additional-modules/Translate/zh-cn/other'

export default {
  ...other,
  ...events,
  ...gateway,
  ...lint,
  ...tasks
}
