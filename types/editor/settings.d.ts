import { ViewerOptions } from 'diagram-js/lib/model'
import { ModuleDeclaration } from 'didi'

export interface EditorSettings {
  processName: string
  processId: string
  processEngine: 'flowable' | 'activiti' | 'camunda'
  paletteMode: 'default' | 'custom' | 'rerender' | 'enhancement'
  penalMode: 'default' | 'custom' | 'rerender'
  bg: string
}

export type ModelerOptions<E extends Element> = ViewerOptions<E> & {
  additionalModules: ModuleDeclaration[]
  moddleExtensions: Object
}
