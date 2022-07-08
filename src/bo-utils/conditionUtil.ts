import { Base, Connection, ModdleElement } from 'diagram-js/lib/model'
import { getBusinessObject, is, isAny } from 'bpmn-js/lib/util/ModelUtil'
import { getEventDefinition } from '@/utils/BpmnImplementationType'
import modeler from '@/store/modeler'
import { createModdleElement } from '@/utils/BpmnExtensionElementsUtil'
import editor from '@/store/editor'

///////////////////////////////// 配置项可见性
const CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway'
]
const defaultConditionTypeOptions: Record<string, string>[] = [
  { label: '无条件( None )', value: 'none' },
  { label: '默认路径( Default )', value: 'default' },
  { label: '条件表达式( Expression )', value: 'expression' },
  { label: '条件脚本( Script )', value: 'script' }
]
// 父节点符合条件的连线
export function isConditionalSource(element) {
  return isAny(element, CONDITIONAL_SOURCES)
}
// 是否是 定义条件的事件 （ 控制变量 Variables 配置 ）
export function isConditionEventDefinition(element: Base): boolean {
  return (
    is(element, 'bpmn:Event') && !!getEventDefinition(element, 'bpmn:ConditionalEventDefinition')
  )
}
export function isExtendStartEvent(element: Base): boolean {
  return is(element, 'bpmn:StartEvent')
}
// 元素 是否符合 可以设置条件 的情况
export function isCanbeConditional(element: Base): boolean {
  return (
    (is(element, 'bpmn:SequenceFlow') && isConditionalSource((element as Connection)?.source)) ||
    isConditionEventDefinition(element)
  )
}

///////////////////////////
// 1. 条件变量部分
export function getVariableNameValue(element: Base): string | undefined {
  if (getConditionalEventDefinition(element)) {
    return (getConditionalEventDefinition(element) as ModdleElement).get('variableName')
  }
}
export function setVariableNameValue(element: Base, value: string | undefined) {
  const modeling = modeler().getModeling
  const eventDefinition = getConditionalEventDefinition(element)
  if (eventDefinition) {
    modeling.updateModdleProperties(element, eventDefinition, { variableName: value || '' })
  }
}

// 2. 条件事件部分
export function getVariableEventsValue(element: Base): string | undefined {
  if (getConditionalEventDefinition(element)) {
    return (getConditionalEventDefinition(element) as ModdleElement).get('variableEvents')
  }
}
export function setVariableEventsValue(element: Base, value: string | undefined) {
  const modeling = modeler().getModeling
  const eventDefinition = getConditionalEventDefinition(element)
  if (eventDefinition) {
    modeling.updateModdleProperties(element, eventDefinition, { variableName: value || '' })
  }
}

// 3. 元素条件类型
export function getConditionTypeValue(element: Base): string {
  const conditionExpression = getConditionExpression(element)
  if (conditionExpression) {
    return conditionExpression.get('language') === undefined ? 'expression' : 'script'
  }
  if (element.source?.businessObject?.default === element.businessObject) return 'default'
  return 'none'
}
export function setConditionTypeValue(element: Base, value: string) {
  if (!value || value === 'none' || value === 'default') {
    updateCondition(element)
    return setDefaultCondition(element as Connection, value === 'default')
  }
  const attributes = {
    // body: '',
    language: value === 'script' ? '' : undefined
  }
  const parent = is(element, 'bpmn:SequenceFlow')
    ? getBusinessObject(element)
    : (getConditionalEventDefinition(element) as ModdleElement)
  const formalExpressionElement = createModdleElement('bpmn:FormalExpression', attributes, parent)
  updateCondition(element, formalExpressionElement)
}

// 4. 元素条件表达式
export function getConditionExpressionValue(element: Base): string | undefined {
  const conditionExpression = getConditionExpression(element)
  if (conditionExpression) {
    return conditionExpression.get('body')
  }
}
export function setConditionExpressionValue(element: Base, body: string | undefined) {
  const parent = is(element, 'bpmn:SequenceFlow')
    ? getBusinessObject(element)
    : (getConditionalEventDefinition(element) as ModdleElement)
  const formalExpressionElement = createModdleElement('bpmn:FormalExpression', { body }, parent)
  updateCondition(element, formalExpressionElement)
}

// 5. 元素脚本来源类型
export function getConditionScriptTypeValue(element: Base): string | undefined {
  const prefix = editor().getProcessEngine
  const conditionExpression = getConditionExpression(element)!
  console.log(conditionExpression)
  if (conditionExpression.get('body') !== undefined) return 'inline'
  if (conditionExpression.get(`${prefix}:resource`) !== undefined) return 'external'
  return 'none'
}
export function setConditionScriptTypeValue(element: Base, value: string | undefined) {
  const prefix = editor().getProcessEngine
  const modeling = modeler().getModeling
  let props
  if (!value || value === 'none') {
    props = { body: undefined, [`${prefix}:resource`]: undefined }
  }
  if (value === 'inline') {
    props = { body: '', [`${prefix}:resource`]: undefined }
  }
  if (value === 'external') {
    props = { body: undefined, [`${prefix}:resource`]: '' }
  }
  modeling.updateModdleProperties(element, getConditionExpression(element)!, props)
}

// 6. 元素脚本 语言类型
export function getConditionScriptLanguageValue(element: Base): string | undefined {
  return getConditionExpression(element)?.get('language')
}
export function setConditionScriptLanguageValue(element: Base, value: string | undefined) {
  const modeling = modeler().getModeling
  modeling.updateModdleProperties(element, getConditionExpression(element)!, { language: value })
}

// 7. 元素脚本 body
export function getConditionScriptBodyValue(element: Base): string | undefined {
  return getConditionExpression(element)?.get('body')
}
export function setConditionScriptBodyValue(element: Base, value: string | undefined) {
  const modeling = modeler().getModeling
  modeling.updateModdleProperties(element, getConditionExpression(element)!, { body: value })
}

// 8. 元素脚本 source
export function getConditionScriptResourceValue(element: Base): string | undefined {
  const prefix = editor().getProcessEngine
  return getConditionExpression(element)?.get(`${prefix}:resource`)
}
export function setConditionScriptResourceValue(element: Base, value: string | undefined) {
  const modeling = modeler().getModeling
  const prefix = editor().getProcessEngine
  modeling.updateModdleProperties(element, getConditionExpression(element)!, {
    [`${prefix}:resource`]: value
  })
}

///////// helpers
// 获取事件的条件定义
export function getConditionTypeOptions(element: Base): Record<string, string>[] {
  if (is(element, 'bpmn:SequenceFlow')) {
    return defaultConditionTypeOptions
  }
  return defaultConditionTypeOptions.filter((condition) => condition.value !== 'default')
}
function getConditionalEventDefinition(
  element: Base | ModdleElement
): ModdleElement | false | undefined {
  if (!is(element, 'bpmn:Event')) return false
  return getEventDefinition(element, 'bpmn:ConditionalEventDefinition')
}
//获取给定元素的条件表达式的值
function getConditionExpression(element: Base | ModdleElement): ModdleElement | undefined {
  const businessObject = getBusinessObject(element)
  if (is(businessObject, 'bpmn:SequenceFlow')) {
    return businessObject.get('conditionExpression')
  }
  if (getConditionalEventDefinition(businessObject)) {
    return (getConditionalEventDefinition(businessObject) as ModdleElement).get('condition')
  }
}
//
function updateCondition(element: Base, condition?: string | ModdleElement) {
  const modeling = modeler().getModeling
  if (is(element, 'bpmn:SequenceFlow')) {
    modeling.updateProperties(element, { conditionExpression: condition })
  } else {
    modeling.updateModdleProperties(element, getConditionalEventDefinition(element), { condition })
  }
}
//
function setDefaultCondition(element: Connection, isDefault: boolean) {
  const modeling = modeler().getModeling
  modeling.updateProperties(element.source, { default: isDefault ? element : undefined })
}
