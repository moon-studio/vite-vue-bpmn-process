import { Base } from 'diagram-js/lib/model'
import { ModdleElement } from 'bpmn-moddle'
import { getBusinessObject, is } from 'bpmn-js/lib/util/ModelUtil'
import editor from '@/store/editor'
import modeler from '@/store/modeler'
import { getServiceTaskLikeBusinessObject } from '@/utils/BpmnImplementationType'
import { getTimerEventDefinition } from '@/utils/BpmnEventDefinitionUtil'
import { isAsync } from '@/utils/BpmnAsyncElement'
import { createModdleElement, getExtensionElementsList } from '@/utils/BpmnExtensionElementsUtil'

//
export function retryTimeCycleVisible(element: Base): boolean {
  const prefix = editor().getProcessEngine
  const businessObject = getBusinessObject(element)
  return (
    (is(element, `${prefix}:AsyncCapable`) && isAsync(businessObject)) || !!isTimerEvent(element)
  )
}
export function taskPriorityVisible(element: Base): boolean {
  const prefix = editor().getProcessEngine
  const businessObject = getBusinessObject(element)
  return (
    (is(element, `${prefix}:JobPriorized`) && isAsync(businessObject)) ||
    is(element, 'bpmn:Process') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef')) ||
    !!isTimerEvent(element)
  )
}
export function isJobExecutable(element: Base): boolean {
  return retryTimeCycleVisible(element) || taskPriorityVisible(element)
}

// 任务优先级
export function getExternalTaskValue(element: Base): string | undefined {
  const prefix = editor().getProcessEngine
  const businessObject = getRelativeBusinessObject(element)
  return businessObject.get(`${prefix}:taskPriority`)
}
export function setExternalTaskValue(element: Base, value: string | undefined) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling
  const businessObject = getRelativeBusinessObject(element)
  modeling.updateModdleProperties(element, businessObject, {
    [`${prefix}:taskPriority`]: value
  })
}

// 重试周期
export function getRetryTimeCycleValue(element: Base): string | undefined {
  const prefix = editor().getProcessEngine
  const businessObject = getBusinessObject(element)
  const failedJobRetryTimeCycle = getExtensionElementsList(
    businessObject,
    `${prefix}:FailedJobRetryTimeCycle`
  )[0]
  return failedJobRetryTimeCycle && failedJobRetryTimeCycle.body
}
export function setRetryTimeCycleValue(element: Base, value: string | undefined) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling
  const moddle = modeler().getModdle!
  const businessObject = getBusinessObject(element)

  let extensionElements = businessObject.get('extensionElements')
  if (!extensionElements) {
    extensionElements = createModdleElement(
      'bpmn:ExtensionElements',
      { values: [] },
      businessObject
    )
    modeling.updateModdleProperties(element, businessObject, { extensionElements })
  }

  let failedJobRetryTimeCycle = getExtensionElementsList(
    businessObject,
    `${prefix}:FailedJobRetryTimeCycle`
  )[0]
  if (!failedJobRetryTimeCycle) {
    failedJobRetryTimeCycle = createModdleElement(
      `${prefix}:FailedJobRetryTimeCycle`,
      {},
      extensionElements
    )
    modeling.updateModdleProperties(element, extensionElements, {
      values: [...extensionElements.get('values'), failedJobRetryTimeCycle]
    })
  }

  modeling.updateModdleProperties(element, failedJobRetryTimeCycle, { body: value })
}

/////////// helpers
function isExternalTaskLike(element: Base): boolean {
  const prefix = editor().getProcessEngine
  const bo = getServiceTaskLikeBusinessObject(element),
    type = bo && bo.get(`${prefix}:type`)
  return bo && is(bo, `${prefix}:ServiceTaskLike`) && type && type === 'external'
}

function getRelativeBusinessObject(element: Base): ModdleElement {
  let businessObject
  if (is(element, 'bpmn:Participant')) {
    businessObject = getBusinessObject(element).get('processRef')
  } else if (isExternalTaskLike(element)) {
    businessObject = getServiceTaskLikeBusinessObject(element)
  } else {
    businessObject = getBusinessObject(element)
  }
  return businessObject
}

function isTimerEvent(element): ModdleElement | undefined | false {
  return is(element, 'bpmn:Event') && getTimerEventDefinition(element)
}
