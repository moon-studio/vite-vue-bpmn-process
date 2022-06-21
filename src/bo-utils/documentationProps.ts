import { Base } from 'diagram-js/lib/model'
import modelerStore from '@/store/modeler'
import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'
import { without } from 'min-dash'

export function getDocumentValue(element: Base): string {
  const businessObject = element?.businessObject
  const documentation = businessObject && findDocumentation(businessObject.get('documentation'))
  return documentation && documentation.text
}

export function setDocumentValue(element: Base, value: string | undefined) {
  const store = modelerStore()

  const modeling = store.getModeling
  const bpmnFactory: BpmnFactory | undefined = store.getModeler?.get('bpmnFactory')

  const businessObject = element.businessObject
  const documentation = findDocumentation(businessObject && businessObject.get('documentation'))
  // (1) 更新或者移除 原有 documentation
  if (documentation) {
    if (value) {
      return modeling.updateModdleProperties(element, documentation, { text: value })
    } else {
      return modeling.updateModdleProperties(element, businessObject, {
        documentation: without(businessObject.get('documentation'), documentation)
      })
    }
  }
  // (2) 创建新的 documentation
  if (value) {
    const newDocumentation = bpmnFactory?.create('bpmn:Documentation', {
      text: value
    })
    return modeling.updateModdleProperties(element, businessObject, {
      documentation: [...businessObject.get('documentation'), newDocumentation]
    })
  }
}

//////////// helpers

const DOCUMENTATION_TEXT_FORMAT = 'text/plain'

function findDocumentation(docs) {
  return docs.find(function (d) {
    return (d.textFormat || DOCUMENTATION_TEXT_FORMAT) === DOCUMENTATION_TEXT_FORMAT
  })
}
