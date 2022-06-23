import { Base } from 'diagram-js/lib/model'
import modelerStore from '@/store/modeler'
import editorStore from '@/store/editor'

export function getProcessExecutable(element: Base): boolean {
  return !!element.businessObject.isExecutable
}

export function setProcessExecutable(element: Base, value: boolean) {
  const store = modelerStore()
  const modeling = store.getModeling

  modeling.updateProperties(element, {
    isExecutable: value
  })
}

export function getProcessVersionTag(element: Base): string | undefined {
  const editor = editorStore()
  const prefix = editor.getProcessEngine

  return element.businessObject.get(`${prefix}:versionTag`)
}

export function setProcessVersionTag(element: Base, value: string) {
  const store = modelerStore()
  const editor = editorStore()

  const modeling = store.getModeling
  const prefix = editor.getProcessEngine

  modeling.updateProperties(element, {
    [`${prefix}:versionTag`]: value
  })
}
