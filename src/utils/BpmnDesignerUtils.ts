import { isAny } from 'bpmn-js/lib/util/ModelUtil'
import { Element } from 'diagram-js/lib/model/Types'

export function isAppendAction(element?: Element) {
  return (
    !element ||
    isAny(element, ['bpmn:Process', 'bpmn:Collaboration', 'bpmn:Participant', 'bpmn:SubProcess'])
  )
}
