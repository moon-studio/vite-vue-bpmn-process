import { defineStore } from 'pinia'
import { defaultSettings } from '@/config'
import { EditorSettings } from 'types/editor/settings'

const state = {
  editorSettings: defaultSettings
}

export default defineStore('editor', {
  state: () => state,
  getters: {
    processDef: (state) => ({
      processName: state.editorSettings.processName,
      processId: state.editorSettings.processId
    }),
    processEngine: (state) => state.editorSettings.processEngine,
    editorConfig: (state) => ({
      bg: state.editorSettings.bg
    })
  },
  actions: {
    updateConfiguration(conf: Partial<EditorSettings>) {
      this.$state.editorSettings = { ...this.$state.editorSettings, ...conf }
    }
  }
})
