import { defineComponent, computed, ref } from 'vue'
import Palette from '@/components/Palette'
import Designer from '@/components/Designer'
import Penal from '@/components/Penal'
import Setting from '@/components/Setting'
import { EditorSettings } from '../types/editor/settings'
import { defaultSettings } from '@/config'

const App = defineComponent({
  setup() {
    const editorSettings = ref<EditorSettings>({ ...defaultSettings })

    const customPalette = computed<boolean>(() => editorSettings.value.paletteMode === 'custom')
    const customPenal = computed<boolean>(() => editorSettings.value.penalMode === 'custom')

    const computedClasses = computed<Object>(() => {
      const baseClass = ['designer-container']
      customPalette.value && baseClass.push('designer-with-palette')
      customPenal.value && baseClass.push('designer-with-penal')
      editorSettings.value.bg === 'image' && baseClass.push('designer-with-bg')
      return baseClass.join(' ')
    })

    return () => (
      <div class={computedClasses.value}>
        {customPalette.value && <Palette></Palette>}
        <Designer {...editorSettings.value}></Designer>
        {customPenal.value && <Penal></Penal>}
        <Setting v-model={[editorSettings, 'settings']}></Setting>
      </div>
    )
  }
})

export default App
