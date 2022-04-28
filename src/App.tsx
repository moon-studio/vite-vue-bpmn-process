import { defineComponent, computed, ref, watchEffect } from 'vue'
import Palette from '@/components/Palette'
import Designer from '@/components/Designer'
import Penal from '@/components/Penal'
import Setting from '@/components/Setting'
import { EditorSettings } from '../types/editor/settings'
import { defaultSettings } from '@/config'
import Logger from '@/utils/Logger'

const logger = new Logger()

const App = defineComponent({
  setup() {
    const editorSettings = ref<EditorSettings>({ ...defaultSettings })

    const processXml = ref<string | undefined>(undefined)

    const customPalette = computed<boolean>(() => editorSettings.value.paletteMode === 'custom')
    const customPenal = computed<boolean>(() => editorSettings.value.penalMode === 'custom')

    const computedClasses = computed<Object>(() => {
      const baseClass = ['designer-container']
      customPalette.value && baseClass.push('designer-with-palette')
      customPenal.value && baseClass.push('designer-with-penal')
      editorSettings.value.bg === 'image' && baseClass.push('designer-with-bg')
      return baseClass.join(' ')
    })

    /* 测试功能部分 */
    watchEffect(() => {
      logger.printBack('success', '[Process Designer XML change]')
    })

    /* 组件渲染 */
    return () => (
      <div class={computedClasses.value} id="designer-container">
        {customPalette.value && <Palette></Palette>}
        <Designer settings={editorSettings.value} v-model={[processXml.value, 'xml']}></Designer>
        {customPenal.value ? <Penal></Penal> : <div class="camunda-penal" id="camunda-penal"></div>}
        <Setting v-model={[editorSettings, 'settings']}></Setting>
      </div>
    )
  }
})

export default App
