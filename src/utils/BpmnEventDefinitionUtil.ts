import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import { Base } from 'diagram-js/lib/model'
import { ModdleElement } from 'bpmn-moddle'
import { find } from 'min-dash'

export function isErrorSupported(element: Base): boolean {
  return (
    isAny(element, ['bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:EndEvent']) &&
    !!getErrorEventDefinition(element)
  )
}

export function getErrorEventDefinition(element: Base): ModdleElement | undefined {
  return getEventDefinition(element, 'bpmn:ErrorEventDefinition')
}

export function isTimerSupported(element: Base): boolean {
  return (
    isAny(element, ['bpmn:StartEvent', 'bpmn:IntermediateCatchEvent', 'bpmn:BoundaryEvent']) &&
    !!getTimerEventDefinition(element)
  )
}

/**
 * Get the timer definition type for a given timer event definition.
 *
 * @param {ModdleElement<bpmn:TimerEventDefinition>} timer
 *
 * @return {string|undefined} the timer definition type
 */
export function getTimerDefinitionType(timer: ModdleElement): string | undefined {
  if (!timer) {
    return
  }

  const timeDate = timer.get('timeDate')
  if (typeof timeDate !== 'undefined') {
    return 'timeDate'
  }

  const timeCycle = timer.get('timeCycle')
  if (typeof timeCycle !== 'undefined') {
    return 'timeCycle'
  }

  const timeDuration = timer.get('timeDuration')
  if (typeof timeDuration !== 'undefined') {
    return 'timeDuration'
  }
}

export function getTimerEventDefinition(element: Base): ModdleElement | undefined {
  return getEventDefinition(element, 'bpmn:TimerEventDefinition')
}

export function getError(element: Base) {
  const errorEventDefinition = getErrorEventDefinition(element)

  return errorEventDefinition && errorEventDefinition.get('errorRef')
}

export function getEventDefinition(element: Base, eventType: string): ModdleElement | undefined {
  const businessObject = getBusinessObject(element)

  const eventDefinitions = businessObject.get('eventDefinitions') || []

  return find(eventDefinitions, function (definition) {
    return is(definition, eventType)
  })
}

export function isMessageSupported(element: Base): boolean {
  return (
    is(element, 'bpmn:ReceiveTask') ||
    (isAny(element, [
      'bpmn:StartEvent',
      'bpmn:EndEvent',
      'bpmn:IntermediateThrowEvent',
      'bpmn:BoundaryEvent',
      'bpmn:IntermediateCatchEvent'
    ]) &&
      !!getMessageEventDefinition(element))
  )
}

export function getMessageEventDefinition(element: Base): ModdleElement | undefined {
  if (is(element, 'bpmn:ReceiveTask')) {
    return getBusinessObject(element)
  }

  return getEventDefinition(element, 'bpmn:MessageEventDefinition')
}

export function getMessage(element: Base): ModdleElement | undefined {
  const messageEventDefinition = getMessageEventDefinition(element)

  return messageEventDefinition && messageEventDefinition.get('messageRef')
}

export function getLinkEventDefinition(element: Base): ModdleElement | undefined {
  return getEventDefinition(element, 'bpmn:LinkEventDefinition')
}

export function getSignalEventDefinition(element: Base): ModdleElement | undefined {
  return getEventDefinition(element, 'bpmn:SignalEventDefinition')
}

export function isLinkSupported(element: Base): boolean {
  return (
    isAny(element, ['bpmn:IntermediateThrowEvent', 'bpmn:IntermediateCatchEvent']) &&
    !!getLinkEventDefinition(element)
  )
}

export function isSignalSupported(element: Base): boolean {
  return is(element, 'bpmn:Event') && !!getSignalEventDefinition(element)
}

export function getSignal(element: Base): ModdleElement | undefined {
  const signalEventDefinition = getSignalEventDefinition(element)

  return signalEventDefinition && signalEventDefinition.get('signalRef')
}

export function getEscalationEventDefinition(element: Base): ModdleElement | undefined {
  return getEventDefinition(element, 'bpmn:EscalationEventDefinition')
}

export function isEscalationSupported(element: Base): boolean {
  return is(element, 'bpmn:Event') && !!getEscalationEventDefinition(element)
}

export function getEscalation(element: Base): ModdleElement | undefined {
  const escalationEventDefinition = getEscalationEventDefinition(element)

  return escalationEventDefinition && escalationEventDefinition.get('escalationRef')
}

export function isCompensationSupported(element: Base): boolean {
  return (
    isAny(element, ['bpmn:EndEvent', 'bpmn:IntermediateThrowEvent']) &&
    !!getCompensateEventDefinition(element)
  )
}

export function getCompensateEventDefinition(element: Base): ModdleElement | undefined {
  return getEventDefinition(element, 'bpmn:CompensateEventDefinition')
}

export function getCompensateActivity(element: Base): ModdleElement | undefined {
  const compensateEventDefinition = getCompensateEventDefinition(element)

  return compensateEventDefinition && compensateEventDefinition.get('activityRef')
}
