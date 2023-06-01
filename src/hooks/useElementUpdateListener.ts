import { onBeforeUnmount, onMounted } from 'vue'
import EventEmitter from '@/utils/EventEmitter'

export default function (listener: Function) {
  const thisListener = listener

  const removeListener = () => {
    EventEmitter.removeListener('element-update', thisListener)
  }

  onMounted(() => {
    thisListener()
    if (EventEmitter.hasListener('element-update', thisListener)) {
      return
    }
    EventEmitter.addListener('element-update', thisListener)
  })
  onBeforeUnmount(() => removeListener())

  return [thisListener, removeListener]
}
