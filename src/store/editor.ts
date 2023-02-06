import { defineStore } from 'pinia'
import { defaultSettings } from '@/config'
import { EditorSettings } from 'types/editor/settings'

const state = {
  editorSettings: defaultSettings
}

export default defineStore('editor', {
  state: () => state,
  getters: {
    getLocales: (state) => state.editorSettings.language,
    getProcessDef: (state) => ({
      processName: state.editorSettings.processName,
      processId: state.editorSettings.processId
    }),
    getProcessEngine: (state) => state.editorSettings.processEngine,
    getEditorConfig: (state) => ({
      bg: state.editorSettings.bg,
      paletteMode: state.editorSettings.paletteMode,
      penalMode: state.editorSettings.penalMode,
      contextPadMode: state.editorSettings.contextPadMode,
      rendererMode: state.editorSettings.rendererMode,
      toolbar: state.editorSettings.toolbar,
      miniMap: state.editorSettings.miniMap,
      contextmenu: state.editorSettings.contextmenu,
      customContextmenu: state.editorSettings.customContextmenu,
      otherModule: state.editorSettings.otherModule,
      templateChooser: state.editorSettings.templateChooser,
      useLint: state.editorSettings.useLint,
      customTheme: state.editorSettings.customTheme
    })
  },
  actions: {
    updateConfiguration(conf: Partial<EditorSettings>) {
      this.$state.editorSettings = { ...this.$state.editorSettings, ...conf }
    },
    updateLanguage(lang: string) {
      this.$state.editorSettings.language = lang || 'zh_CN'
    }
  }
})
