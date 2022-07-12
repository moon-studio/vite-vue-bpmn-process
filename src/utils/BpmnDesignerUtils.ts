import { isAny } from 'bpmn-js/lib/util/ModelUtil'
import { Base } from 'diagram-js/lib/model'

export function isAppendAction(element?: Base) {
  return (
    !element ||
    isAny(element, ['bpmn:Process', 'bpmn:Collaboration', 'bpmn:Participant', 'bpmn:SubProcess'])
  )
}
