import { defineStore } from 'pinia'
import { defaultSettings } from '@/config'

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
  }
})
