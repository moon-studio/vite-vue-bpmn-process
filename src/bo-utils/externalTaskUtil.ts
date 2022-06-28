import { Base, ModdleElement } from 'diagram-js/lib/model'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import editor from '@/store/editor'
import modeler from '@/store/modeler'
import { getServiceTaskLikeBusinessObject } from '@/utils/BpmnImplementationType'

export function getExternalTaskValue(element: Base): string | undefined {
  const prefix = editor().getProcessEngine
  const businessObject = getRelativeBusinessObject(element)
  return businessObject.get(`${prefix}:taskPriority`)
}

export function setExternalTaskValue(element: Base, value: string | undefined) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling
  const businessObject = getRelativeBusinessObject(element)
  modeling.updateModdleProperties(element, businessObject, {
    [`${prefix}:taskPriority`]: value
  })
}

export function isExternalTask(element: Base): boolean {
  const businessObject = getBusinessObject(element)
  return !(
    !is(element, 'bpmn:Process') &&
    !(is(element, 'bpmn:Participant') && businessObject.get('processRef')) &&
    !isExternalTaskLike(element)
  )
}

/////////// helpers

export function isExternalTaskLike(element: Base): boolean {
  const prefix = editor().getProcessEngine
  const bo = getServiceTaskLikeBusinessObject(element),
    type = bo && bo.get(`${prefix}:type`)
  return bo && is(bo, `${prefix}:ServiceTaskLike`) && type && type === 'external'
}

function getRelativeBusinessObject(element: Base): ModdleElement {
  let businessObject
  if (is(element, 'bpmn:Participant')) {
    businessObject = getBusinessObject(element).get('processRef')
  } else if (isExternalTaskLike(element)) {
    businessObject = getServiceTaskLikeBusinessObject(element)
  } else {
    businessObject = getBusinessObject(element)
  }
  return businessObject
}
