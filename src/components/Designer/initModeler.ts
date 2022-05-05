import type { ModelerOptions } from 'types/editor/settings'
import Modeler from 'bpmn-js/lib/Modeler'
import EventEmitter from '@/utils/EventEmitter'
import { createNewDiagram } from '@/utils'

export default function (designer, modelerModules, settings, xml, emit) {
  ;(window.bpmnInstances?.modeler && window.bpmnInstances.modeler.destroy()) || (window.bpmnInstances = {})

  const options: ModelerOptions<Element> = {
    container: designer.value as HTMLElement,
    keyboard: {
      bindTo: designer.value as HTMLElement
    },
    additionalModules: modelerModules.value[0] || [],
    moddleExtensions: modelerModules.value[1] || {}
  }
  settings.value?.penalMode !== 'custom' && (options.propertiesPanel = { parent: '#camunda-penal' })

  const modeler = (window.bpmnInstances.modeler = new Modeler(options))

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
