import type { ModelerOptions } from 'types/editor/settings'
import Modeler from 'bpmn-js/lib/Modeler'
import EventEmitter from '@/utils/EventEmitter'
import EmptyXML from '@/utils/EmptyXML'
import Canvas from 'diagram-js/lib/core/Canvas'

const createNewDiagram = async function (newXml, settings) {
  try {
    const { processId, processName, processEngine } = settings.value
    const newId: string = processId ? processId : `Process_${new Date().getTime()}`
    const newName: string = processName || `业务流程_${new Date().getTime()}`
    const xmlString = newXml || EmptyXML(newId, newName, processEngine)
    const { modeler } = window.bpmnInstances
    const { warnings } = await modeler.importXML(xmlString)
    if (warnings && warnings.length) {
      warnings.forEach((warn) => console.warn(warn))
    }
  } catch (e) {
    console.error(`[Process Designer Warn]: ${typeof e === 'string' ? e : (e as Error)?.message}`)
  }
}

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

  const canvas: Canvas = modeler.get('canvas')

  console.log(canvas.getDefaultLayer())

  modeler.on('element.click', ({ element }: any) => {
    console.log(canvas.getAbsoluteBBox(element))
  })

  modeler.on('commandStack.changed', async (event) => {
    try {
      const { xml } = await modeler.saveXML({ format: true })
      emit('update:xml', xml)
      emit('command-stack-changed', event)
    } catch (error) {
      console.error(error)
    }
  })

  createNewDiagram(xml.value, settings)
}
