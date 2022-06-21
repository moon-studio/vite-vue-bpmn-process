import { EditorSettings } from 'types/editor/settings'

export const defaultSettings: EditorSettings = {
  processId: `Process_${new Date().getTime()}`,
  processName: `业务流程`,
  processEngine: 'camunda',
  paletteMode: 'default',
  penalMode: 'default',
  contextPadMode: 'default',
  rendererMode: 'default',
  bg: 'grid-image',
  toolbar: true,
  customTheme: {}
}
