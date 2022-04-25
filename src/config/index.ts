import { EditorSettings } from '../../types/editor/settings'

export const defaultSettings: EditorSettings = {
  processId: `Process_${new Date().getTime()}`,
  processName: `业务流程`,
  processEngine: 'camunda',
  paletteMode: 'custom',
  penalMode: 'custom',
  bg: 'image'
}
