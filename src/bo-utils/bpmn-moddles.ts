import { FormalExpression } from 'bpmn-moddle'

/**
 * 创建 bpmn 条件对象 FormalExpression
 * @param options {FormalExpression}
 * @returns {FormalExpression}
 */
export function createFormalExpression(options: FormalExpression) {
  const { resource, language, evaluatesToTypeRef } = options || {}
  return window.bpmnInstances.moddle.create('bpmn:FormalExpression', {
    resource,
    language,
    evaluatesToTypeRef
  })
}
