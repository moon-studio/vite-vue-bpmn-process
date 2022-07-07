import { defineComponent, computed, ref } from 'vue'
import Toolbar from '@/components/Toolbar'
import Palette from '@/components/Palette'
import Designer from '@/components/Designer'
import Panel from '@/components/Panel'
import Setting from '@/components/Setting'
import { EditorSettings } from 'types/editor/settings'
import { defaultSettings } from '@/config'

import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import { NConfigProvider, NDialogProvider, NMessageProvider } from 'naive-ui'

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)

const App = defineComponent({
  setup() {
    const editorSettings = ref<EditorSettings>({ ...defaultSettings })

    const processXml = ref<string | undefined>(undefined)

    const customPalette = computed<boolean>(() => editorSettings.value.paletteMode === 'custom')
    const customPenal = computed<boolean>(() => editorSettings.value.penalMode === 'custom')
    const showToolbar = computed<boolean>(() => editorSettings.value.toolbar)

    const computedClasses = computed<string>(() => {
      const baseClass = ['designer-container']
      customPalette.value && baseClass.push('designer-with-palette')
      customPenal.value && baseClass.push('designer-with-penal')
      editorSettings.value.bg === 'grid-image' && baseClass.push('designer-with-bg')
      editorSettings.value.bg === 'image' && baseClass.push('designer-with-image')

      return baseClass.join(' ')
    })

    /* 组件渲染 */
    return () => (
      <NConfigProvider
        abstract
        componentOptions={{ DynamicInput: { buttonSize: 'small' } }}
        hljs={hljs}
      >
        <NDialogProvider>
          <div class={computedClasses.value} id="designer-container">
            <NMessageProvider>
              {showToolbar.value && <Toolbar></Toolbar>}
              <div class="main-content">
                {customPalette.value && <Palette></Palette>}
                <Designer v-model={[processXml.value, 'xml']}></Designer>
                {customPenal.value ? (
                  <Panel></Panel>
                ) : (
                  <div class="camunda-penal" id="camunda-penal"></div>
                )}
              </div>
              <Setting v-model={[editorSettings.value, 'settings']}></Setting>
            </NMessageProvider>
          </div>
        </NDialogProvider>
      </NConfigProvider>
    )
  }
})

export default App
