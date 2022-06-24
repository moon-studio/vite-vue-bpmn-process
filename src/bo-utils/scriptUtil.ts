import { ModdleElement } from 'diagram-js/lib/model'
import editor from '@/store/editor'
import modeler from '@/store/modeler'

export function createScript(props: Record<string, string>): ModdleElement {
  const prefix = editor().getProcessEngine
  const moddle = modeler().getModdle

  return moddle!.create(`${prefix}`, props)
}
