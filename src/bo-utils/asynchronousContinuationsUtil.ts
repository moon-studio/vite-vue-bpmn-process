import { Element } from 'diagram-js/lib/model/Types'
import { ModdleElement } from 'bpmn-moddle'
import editor from '@/store/editor'
import modeler from '@/store/modeler'
import { is } from 'bpmn-js/lib/util/ModelUtil'

////////// only in element extends bpmn:Task
export function getACBefore(element: Element): boolean {
  const prefix = editor().getProcessEngine
  return isAsyncBefore(element.businessObject, prefix)
}
export function setACBefore(element: Element, value: boolean) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling
  // overwrite the legacy `async` property, we will use the more explicit `asyncBefore`
  modeling.updateModdleProperties(element, element.businessObject, {
    [`${prefix}:asyncBefore`]: value,
    [`${prefix}:async`]: undefined
  })
}

export function getACAfter(element: Element): boolean {
  const prefix = editor().getProcessEngine
  return isAsyncAfter(element.businessObject, prefix)
}
export function setACAfter(element: Element, value: boolean) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling
  modeling.updateModdleProperties(element, element.businessObject, {
    [`${prefix}:asyncAfter`]: value
  })
}

export function getACExclusive(element: Element): boolean {
  const prefix = editor().getProcessEngine
  return isExclusive(element.businessObject, prefix)
}
export function setACExclusive(element: Element, value: boolean) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling
  modeling.updateModdleProperties(element, element.businessObject, {
    [`${prefix}:exclusive`]: value
  })
}

//////////////////// helper
// 是否支持异步属性
export function isAsynchronous(element: BpmnElement): boolean {
  const prefix = editor().getProcessEngine
  return is(element, `${prefix}:AsyncCapable`)
}

// Returns true if the attribute 'asyncBefore' is set to true.
function isAsyncBefore(bo: ModdleElement, prefix: string): boolean {
  return !!(bo.get(`${prefix}:asyncBefore`) || bo.get(`${prefix}:async`))
}

// Returns true if the attribute 'asyncAfter' is set to true.
function isAsyncAfter(bo: ModdleElement, prefix: string): boolean {
  return !!bo.get(`${prefix}:asyncAfter`)
}

// Returns true if the attribute 'exclusive' is set to true.
function isExclusive(bo: ModdleElement, prefix: string): boolean {
  return !!bo.get(`${prefix}:exclusive`)
}
