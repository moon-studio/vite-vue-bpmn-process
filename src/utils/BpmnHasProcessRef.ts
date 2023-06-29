import { is } from 'bpmn-js/lib/util/ModelUtil'
import { Element } from 'diagram-js/lib/model/Types'

function hasProcessRef(element: Element): boolean {
  return (
    (is(element, 'bpmn:Participant') && element.businessObject.get('processRef')) ||
    is(element, 'bpmn:Process')
  )
}
