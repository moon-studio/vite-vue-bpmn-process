import { defineStore } from 'pinia'
import { defaultSettings } from '@/config'
import { EditorSettings } from 'types/editor/settings'

const state = {
  editorSettings: defaultSettings
}

export default defineStore('editor', {
  state: () => state,
  getters: {
    getProcessDef: (state) => ({
      processName: state.editorSettings.processName,
      processId: state.editorSettings.processId
    }),
    getProcessEngine: (state) => state.editorSettings.processEngine,
    getEditorConfig: (state) => ({
      bg: state.editorSettings.bg
    })
  },
  actions: {
    updateConfiguration(conf: Partial<EditorSettings>) {
      this.$state.editorSettings = { ...this.$state.editorSettings, ...conf }
    }
  }
})
