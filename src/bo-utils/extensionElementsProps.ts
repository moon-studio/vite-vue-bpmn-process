import { Base, ModdleElement } from 'diagram-js/lib/model'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { getExtensionElementsList } from '@/utils/BpmnExtensionElementsUtil'
import modelerStore from '@/store/modeler'
import editorStore from '@/store/editor'
import { without } from 'min-dash'

/////// 功能函数
export function getExtensionProperties(element: Base): ModdleElement[] {
  const businessObject = getRelevantBusinessObject(element)

  if (!businessObject) return []
  return getPropertiesList(businessObject) || []
}

export function addExtensionProperty(element: Base, property) {
  try {
    const store = modelerStore()
    const editor = editorStore()

    const moddle = store.getModdle
    const modeling = store.getModeling
    const prefix = editor.getProcessEngine

    const businessObject = getRelevantBusinessObject(element)

    // 判断 extensionElements
    let extensionElements = businessObject.get('extensionElements')
    if (!extensionElements) {
      extensionElements = moddle!.create('bpmn:ExtensionElements', { values: [] })
      extensionElements.$parent = element.businessObject
      modeling.updateModdleProperties(element, businessObject, { extensionElements })
    }
    // 判断 extensionElements 是否有 properties
    let properties = getProperties(businessObject)
    if (!properties) {
      properties = moddle!.create(`${prefix}:Properties`, { values: [] })
      properties.$parent = extensionElements
      modeling.updateModdleProperties(element, extensionElements, {
        values: [...extensionElements.get('values'), properties]
      })
    }
    // 创建新属性并添加
    const newProperty = moddle!.create(`${prefix}:Property`, JSON.parse(JSON.stringify(property)))
    newProperty.$parent = properties
    modeling.updateModdleProperties(element, properties, {
      values: [...properties?.get('values'), newProperty]
    })
  } catch (e) {
    console.log(e)
  }
}

export function removeExtensionProperty(element: Base, index: number) {
  const businessObject = getRelevantBusinessObject(element)
  const extensionElements = businessObject.get('extensionElements')
  const properties = getProperties(businessObject)
  if (!properties) return

  const store = modelerStore()
  const modeling = store.getModeling

  const newProperties = properties.get('values')
  newProperties && newProperties.splice(index, 1)

  if (!newProperties || !newProperties.length) {
    modeling.updateModdleProperties(element, extensionElements, {
      // @ts-ignore
      values: without(extensionElements.get('values'), properties)
    })
  } else {
    modeling.updateModdleProperties(element, properties, {
      values: newProperties
    })
  }
}

///// helpers
function getRelevantBusinessObject(element: Base) {
  const businessObject = getBusinessObject(element)
  if (is(element, 'bpmn:Participant')) {
    return businessObject.get('processRef')
  }
  return businessObject
}
function getPropertiesList(bo: ModdleElement): [] {
  const properties = getProperties(bo)
  return properties && properties.get('values')
}
function getProperties(bo: ModdleElement): ModdleElement | null {
  return getExtensionElementsList(bo)[0]
}
