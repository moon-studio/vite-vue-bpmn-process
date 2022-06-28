import { EditorSettings } from 'types/editor/settings'

export const defaultSettings: EditorSettings = {
  processId: `Process_${new Date().getTime()}`,
  processName: `业务流程`,
  processEngine: 'camunda',
  paletteMode: 'rewrite',
  penalMode: 'custom',
  contextPadMode: 'default',
  rendererMode: 'rewrite',
  bg: 'grid-image',
  toolbar: true,
  templateChooser: false,
  useLint: false,
  customTheme: {}
}
