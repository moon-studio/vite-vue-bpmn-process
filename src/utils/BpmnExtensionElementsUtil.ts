import { is } from 'bpmn-js/lib/util/ModelUtil'
import { ModdleElement } from 'diagram-js/lib/model'

import { isArray } from 'min-dash'

/**
 * Get extension elements of business object. Optionally filter by type.
 *
 * @param  {ModdleElement} businessObject
 * @param  {String} [type=undefined]
 * @returns {Array<ModdleElement>}
 */
export function getExtensionElementsList(
  businessObject: ModdleElement,
  type?: string
): ModdleElement[] {
  const extensionElements = businessObject.get('extensionElements')

  if (!extensionElements) {
    return []
  }

  const values = extensionElements.get('values')

  if (!values || !values.length) {
    return []
  }

  if (type) {
    return values.filter((value) => is(value, type))
  }

  return values
}
