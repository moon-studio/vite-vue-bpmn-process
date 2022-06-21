import tasks from '@/components/AddiModules/Translate/zh-cn/tasks'
import events from '@/components/AddiModules/Translate/zh-cn/events'
import gateway from '@/components/AddiModules/Translate/zh-cn/gateway'
import lint from '@/components/AddiModules/Translate/zh-cn/lint'
import other from '@/components/AddiModules/Translate/zh-cn/other'

export default {
  ...other,
  ...events,
  ...gateway,
  ...lint,
  ...tasks
}