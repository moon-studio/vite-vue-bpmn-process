export interface EditorSettings {
  processName: string
  processId: string
  processEngine: 'flowable' | 'activiti' | 'camunda'
  paletteMode: 'default' | 'custom' | 'rerender'
  penalMode: 'default' | 'custom' | 'rerender'
  bg: string
}
