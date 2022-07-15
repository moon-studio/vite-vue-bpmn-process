import { ModdleElement } from 'bpmn-moddle'
import editor from '@/store/editor'

export function isAsyncBefore(bo: ModdleElement): boolean {
  const prefix = editor().getProcessEngine
  return !!(bo.get(`${prefix}:asyncBefore`) || bo.get(`${prefix}:async`))
}

export function isAsyncAfter(bo: ModdleElement): boolean {
  const prefix = editor().getProcessEngine
  return !!bo.get(`${prefix}:asyncAfter`)
}

export function isAsync(bo: ModdleElement): boolean {
  return isAsyncAfter(bo) || isAsyncBefore(bo)
}
