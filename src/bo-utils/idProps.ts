import { Base } from 'diagram-js/lib/model'
import modelerStore from '@/store/modeler'
import { isIdValid } from '@/utils/BpmnValidator'

export function getIdValue(element: Base): string {
  return element.businessObject.id
}

export function setIdValue(element: Base, value: string) {
  const errorMsg = isIdValid(element.businessObject, value)

  if (errorMsg && errorMsg.length) {
    return window.__messageBox.warning(errorMsg)
  }

  const store = modelerStore()
  const modeling = store.getModeling

  modeling.updateProperties(element, {
    id: value
  })
}
