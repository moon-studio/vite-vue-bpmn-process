import { EditorSettings } from 'types/editor/settings'
import { markRaw, Ref } from 'vue'
import { ViewerOptions } from 'diagram-js/lib/model'
import Modeler from 'bpmn-js/lib/Modeler'
import { createNewDiagram } from '@/utils'
import EventEmitter from '@/utils/EventEmitter'
import modelerStore from '@/store/modeler'

export default function (
  designer: Ref<HTMLElement | null>,
  modelerModules: ViewerOptions<Element>,
  settings: Ref<EditorSettings>,
  xml: Ref<string | undefined>,
  emit
) {
  if (window.bpmnInstances?.modeler) {
    window.bpmnInstances.modeler.destroy()
  }
  window.bpmnInstances = {}

  const store = modelerStore()

  const options: ViewerOptions<Element> = {
    container: designer!.value as HTMLElement,
    keyboard: {
      bindTo: designer!.value as HTMLElement
    },
    additionalModules: modelerModules[0] || [],
    moddleExtensions: modelerModules[1] || {},
    ...modelerModules[2]
  }

  const modeler: Modeler = (window.bpmnInstances.modeler = new Modeler(options))

  store.setModeler(markRaw(modeler))
  store.setModules('moddle', markRaw(modeler.get('moddle')))
  store.setModules('modeling', markRaw(modeler.get('modeling')))
  store.setModules('canvas', markRaw(modeler.get('canvas')))
  store.setModules('elementRegistry', markRaw(modeler.get('elementRegistry')))

  EventEmitter.instance.emit('modeler-init', modeler)

  modeler.on('commandStack.changed', async (event) => {
    try {
      const { xml } = await modeler.saveXML({ format: true })

      emit('update:xml', xml)
      emit('command-stack-changed', event)
    } catch (error) {
      console.error(error)
    }
  })

  createNewDiagram(xml.value, settings.value)
}
