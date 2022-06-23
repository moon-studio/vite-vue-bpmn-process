import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { Base, ModdleElement } from 'diagram-js/lib/model'
import {
  getExtensionElementsList,
  addExtensionElements,
  removeExtensionElements
} from '@/utils/BpmnExtensionElementsUtil'
import editor from '@/store/editor'
import modeler from '@/store/modeler'

export const EXTENSION_LISTENER_TYPE = {
  class: 'Java class',
  expression: 'Expression',
  delegateExpression: 'Delegate expression',
  script: 'Script'
}

// extension listener list
export function getExtensionListeners(element: Base): ModdleElement[] {
  const prefix = editor().getProcessEngine
  const businessObject = getListenersContainer(element)
  return getExtensionElementsList(businessObject, `${prefix}:ExecutionListener`)
}

// create an empty extension listener and update element's businessObject
export function addEmptyExtensionListener(element: Base) {
  const prefix = editor().getProcessEngine
  const moddle = modeler().getModdle

  const listener = moddle!.create(`${prefix}:ExecutionListener`, {
    event: getDefaultEvent(element),
    class: ''
  })

  const businessObject = getListenersContainer(element)

  addExtensionElements(element, businessObject, listener)
}

// remove an extension listener
export function removeExtensionListener(element: Base, index: number) {
  const listeners = getExtensionListeners(element)
  const listener = listeners[index]
  removeExtensionElements(element, getListenersContainer(element), listener)
}

////////////// helpers

function getListenersContainer(element: Base): ModdleElement {
  const businessObject = getBusinessObject(element)

  return businessObject.get('processRef') || businessObject
}

function getDefaultEvent(element: Base) {
  return is(element, 'bpmn:SequenceFlow') ? 'take' : 'start'
}
