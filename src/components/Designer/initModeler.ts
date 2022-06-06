import { EditorSettings } from 'types/editor/settings'
import { Ref, ComputedRef } from 'vue'
import { ViewerOptions } from 'diagram-js/lib/model'
import Modeler from 'bpmn-js/lib/Modeler'
import EventEmitter from '@/utils/EventEmitter'
import { createNewDiagram } from '@/utils'

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

  const options: ViewerOptions<Element> = {
    container: designer!.value as HTMLElement,
    keyboard: {
      bindTo: designer!.value as HTMLElement
    },
    additionalModules: modelerModules[0] || [],
    moddleExtensions: modelerModules[1] || {},
    ...modelerModules[2]
  }

  const modeler = (window.bpmnInstances.modeler = new Modeler(options))

  console.log(modeler)

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
