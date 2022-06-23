import { Base } from 'diagram-js/lib/model'
import editor from '@/store/editor'
import modeler from '@/store/modeler'

////////// only in bpmn:StartEvent
export function getInitiatorValue(element: Base): string | undefined {
  const prefix = editor().getProcessEngine

  return element.businessObject.get(`${prefix}:initiator`)
}
export function setInitiatorValue(element: Base, value: string) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling

  modeling.updateModdleProperties(element, element.businessObject, {
    [`${prefix}:initiator`]: value
  })
}
