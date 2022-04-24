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

    const computedClasses = computed(() => {
      const baseClass = ['designer-container']
      editorSettings.value.paletteMode === 'custom' && baseClass.push('designer-with-palette')
      editorSettings.value.penalMode === 'custom' && baseClass.push('designer-with-penal')
      editorSettings.value.bg === 'image' && baseClass.push('designer-with-bg')
      return baseClass.join(' ')
    })

    const updateSettings = (e) => (editorSettings.value = { ...e })

    return () => (
      <div class={computedClasses.value}>
        <Palette></Palette>
        <Designer></Designer>
        <Penal></Penal>
        <Setting v-model={[editorSettings, 'settings']}></Setting>
      </div>
    )
  }
})

export default App
