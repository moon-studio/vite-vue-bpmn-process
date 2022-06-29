import { Base } from 'diagram-js/lib/model'
import editor from '@/store/editor'
import modeler from '@/store/modeler'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'

////////// only in bpmn:StartEvent
export function getInitiatorValue(element: Base): string | undefined {
  const prefix = editor().getProcessEngine
  const businessObject = getBusinessObject(element)

  return businessObject.get(`${prefix}:initiator`)
}
export function setInitiatorValue(element: Base, value: string | undefined) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling
  const businessObject = getBusinessObject(element)
  modeling.updateModdleProperties(element, businessObject, {
    [`${prefix}:initiator`]: value
  })
}

export function isStartInitializable(element: Base): boolean {
  const prefix = editor().getProcessEngine
  return is(element, `${prefix}:Initiator`) && !is(element.parent, 'bpmn:SubProcess')
}
