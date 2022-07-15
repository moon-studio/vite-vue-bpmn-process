import { is } from 'bpmn-js/lib/util/ModelUtil'
import { Base } from 'diagram-js/lib/model'
import { ModdleElement } from 'bpmn-moddle'
import { isArray } from 'min-dash'
import modeler from '@/store/modeler'

/**
 * Get extension elements of business object. Optionally filter by type.
 */
export function getExtensionElementsList(
  businessObject: ModdleElement,
  type?: string
): ModdleElement[] {
  const extensionElements = businessObject?.get('extensionElements')
  if (!extensionElements) return []

  const values = extensionElements.get('values')
  if (!values || !values.length) return []

  if (type) return values.filter((value) => is(value, type))

  return values
}

/**
 * Add one or more extension elements. Create bpmn:ExtensionElements if it doesn't exist.
 */
export function addExtensionElements(
  element: Base,
  businessObject: ModdleElement,
  extensionElementToAdd: ModdleElement
) {
  const modeling = modeler().getModeling
  let extensionElements = businessObject.get('extensionElements')

  // (1) create bpmn:ExtensionElements if it doesn't exist
  if (!extensionElements) {
    extensionElements = createModdleElement(
      'bpmn:ExtensionElements',
      { values: [] },
      businessObject
    )
    modeling.updateModdleProperties(element, businessObject, { extensionElements })
  }
  extensionElementToAdd.$parent = extensionElements

  // (2) add extension element to list
  modeling.updateModdleProperties(element, extensionElements, {
    values: [...extensionElements.get('values'), extensionElementToAdd]
  })
}

/**
 * Remove one or more extension elements. Remove bpmn:ExtensionElements afterwards if it's empty.
 */
export function removeExtensionElements(
  element: Base,
  businessObject: ModdleElement,
  extensionElementsToRemove: ModdleElement | ModdleElement[]
) {
  if (!isArray(extensionElementsToRemove)) {
    extensionElementsToRemove = [extensionElementsToRemove]
  }

  const extensionElements = businessObject.get('extensionElements'),
    values = extensionElements
      .get('values')
      .filter((value) => !extensionElementsToRemove.includes(value))

  const modeling = modeler().getModeling
  modeling.updateModdleProperties(element, extensionElements, { values })
}

/////////////
export function createModdleElement(
  elementType: string,
  properties: Record<string, any>,
  parent?: Base | ModdleElement
): ModdleElement {
  const moddle = modeler().getModdle!
  const element = moddle.create(elementType, properties)
  parent && (element.$parent = parent)
  return element
}
