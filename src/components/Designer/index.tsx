import { defineComponent, ref, toRefs, nextTick, watch } from 'vue'
import { defaultSettings } from '@/config'
import modulesAndModdle from '@/components/Designer/modulesAndModdle'
import initModeler from '@/components/Designer/initModeler'

import type { PropType, ComputedRef } from 'vue'
import type { EditorSettings } from 'types/editor/settings'
import type { ModuleDeclaration } from 'didi'

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
    !window.bpmnInstances && (window.bpmnInstances = {})

    const { settings, xml } = toRefs(props)
    const designer = ref<HTMLDivElement | null>(null)

    const modelerModules = modulesAndModdle(settings)

    watch(
      () => modelerModules.value,
      () => nextTick().then(() => initModeler(designer, modelerModules.value, settings, xml, emit)),
      { immediate: true }
    )

    return () => <div ref={designer} class="designer"></div>
  }
})

export default Designer
