import { defineComponent, ref, toRefs, nextTick, watch } from 'vue'
import editor from '@/store/editor'
import { defaultSettings } from '@/config'
import modulesAndModdle from '@/components/Designer/modulesAndModdle'
import initModeler from '@/components/Designer/initModeler'

import type { PropType } from 'vue'
import type { EditorSettings } from 'types/editor/settings'
import { storeToRefs } from 'pinia'

const Designer = defineComponent({
  name: 'Designer',
  props: {
    xml: {
      type: String as PropType<string>,
      default: undefined
    },
    settings: {
      type: Object as PropType<EditorSettings>,
      default: () => defaultSettings
    }
  },
  emits: ['update:xml', 'command-stack-changed'],
  setup(props, { emit }) {
    const editorStore = editor()
    const { editorSettings } = storeToRefs(editorStore)
    const { xml } = toRefs(props)
    const designer = ref<HTMLDivElement | null>(null)

    const modelerModules = modulesAndModdle(editorSettings)

    watch(
      () => modelerModules.value,
      async () => {
        await nextTick()
        initModeler(designer, modelerModules.value, editorSettings, xml, emit)
      },
      { immediate: true }
    )

    return () => <div ref={designer} class="designer"></div>
  }
})

export default Designer
