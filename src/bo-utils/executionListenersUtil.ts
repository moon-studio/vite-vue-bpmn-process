import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil'
import { Base, ModdleElement } from 'diagram-js/lib/model'
import {
  getExtensionElementsList,
  addExtensionElements,
  removeExtensionElements
} from '@/utils/BpmnExtensionElementsUtil'
import editor from '@/store/editor'
import modeler from '@/store/modeler'

export const EXECUTION_LISTENER_TYPE = {
  class: 'Java class',
  expression: 'Expression',
  delegateExpression: 'Delegate expression',
  script: 'Script'
}

// execution listener list
export function getExecutionListeners(element: Base): ModdleElement[] {
  const prefix = editor().getProcessEngine
  const businessObject = getListenersContainer(element)
  return getExtensionElementsList(businessObject, `${prefix}:ExecutionListener`)
}

// create an empty execution listener and update element's businessObject
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

// remove an execution listener
export function removeExecutionListener(element: Base, listener: ModdleElement) {
  removeExtensionElements(element, getListenersContainer(element), listener)
}

////////////// helpers
export function isExecutable(element: Base): boolean {
  return !(is(element, 'bpmn:Participant') && !element?.businessObject.processRef)
}
export function getExecutionListenerType(listener: ModdleElement): string {
  const prefix = editor().getProcessEngine
  console.log('listener:', listener, listener.get('class'), listener.get(`${prefix}:class`))
  if (isAny(listener, [`${prefix}:ExecutionListener`])) {
    if (listener.get(`${prefix}:class`)) return 'class'
    if (listener.get(`${prefix}:expression`)) return 'expression'
    if (listener.get(`${prefix}:delegateExpression`)) return 'delegateExpression'
    if (listener.get('script')) return 'script'
  }
  return ''
}

function getListenersContainer(element: Base): ModdleElement {
  const businessObject = getBusinessObject(element)

  return businessObject?.get('processRef') || businessObject
}

function getDefaultEvent(element: Base) {
  return is(element, 'bpmn:SequenceFlow') ? 'take' : 'start'
}
