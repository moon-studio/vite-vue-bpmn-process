const SPACE_REGEX = /\s/

// for QName validation as per http://www.w3.org/TR/REC-xml/#NT-NameChar
const QNAME_REGEX = /^([a-z][\w-.]*:)?[a-z_][\w-.]*$/i

// for ID validation as per BPMN Schema (QName - Namespace)
const ID_REGEX = /^[a-z_][\w-.]*$/i

export function containsSpace(value) {
  return SPACE_REGEX.test(value)
}

/**
 * checks whether the id value is valid
 *
 * @param {ModdleElement} element
 * @param {String} idValue
 * @param {Function} translate
 *
 * @return {String} error message
 */
export function isIdValid(element, idValue) {
  const assigned = element.$model.ids.assigned(idValue)
  const idAlreadyExists = assigned && assigned !== element

  if (!idValue) {
    return 'ID must not be empty.'
  }

  if (idAlreadyExists) {
    return 'ID must be unique.'
  }

  return validateId(idValue)
}
export function validateId(idValue) {
  if (containsSpace(idValue)) {
    return 'ID must not contain spaces.'
  }

  if (!ID_REGEX.test(idValue)) {
    if (QNAME_REGEX.test(idValue)) {
      return 'ID must not contain prefix.'
    }

    return 'ID must be a valid QName.'
  }
}
