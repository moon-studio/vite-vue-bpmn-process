import { markRaw, Ref } from 'vue'
import { ViewerOptions } from 'diagram-js/lib/model'
import Modeler from 'bpmn-js/lib/Modeler'
import EventEmitter from '@/utils/EventEmitter'
import modelerStore from '@/store/modeler'
import { Moddle } from 'moddle'
import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import Canvas from 'diagram-js/lib/core/Canvas'
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
import EnhancementContextmenu from '@/additional-functions/EnhancementContextmenu'

export default function (
  designer: Ref<HTMLElement | null>,
  modelerModules: ViewerOptions<Element>,
  emit
) {
  const store = modelerStore()

  const options: ViewerOptions<Element> = {
    container: designer!.value as HTMLElement,
    additionalModules: modelerModules[0] || [],
    moddleExtensions: modelerModules[1] || {},
    ...modelerModules[2]
  }
  // 清除旧 modeler
  store.getModeler && store.getModeler.destroy()
  store.setModeler(null)

  const modeler: Modeler = new Modeler(options)

  store.setModeler(markRaw(modeler))
  store.setModules('moddle', markRaw(modeler.get<Moddle>('moddle')))
  store.setModules('modeling', markRaw(modeler.get<Modeling>('modeling')))
  store.setModules('canvas', markRaw(modeler.get<Canvas>('canvas')))
  store.setModules('elementRegistry', markRaw(modeler.get<ElementRegistry>('elementRegistry')))

  EventEmitter.emit('modeler-init', modeler)

  EnhancementContextmenu(modeler)

  modeler.on('commandStack.changed', async (event) => {
    try {
      const { xml } = await modeler.saveXML({ format: true })

      emit('update:xml', xml)
      emit('command-stack-changed', event)
    } catch (error) {
      console.error(error)
    }
  })
}
