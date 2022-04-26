import { computed, defineComponent, onMounted, PropType, ref, toRefs, watchEffect, nextTick, watch } from 'vue'
import Modeler from 'bpmn-js/lib/Modeler'
import EmptyXML from '@/utils/EmptyXML'
import EventEmitter from '@/utils/EventEmitter'
import Logger from '@/utils/Logger'

import translate from '@/components/Moddles/Translate'
import simulationModeler from 'bpmn-js-token-simulation'
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import CamundaExtensionModule from 'camunda-bpmn-moddle/lib'
import camundaModdleDescriptors from 'camunda-bpmn-moddle/resources/camunda.json'
import { defaultSettings } from '@/config'

import { EditorSettings, ModelerOptions } from '../../../types/editor/settings'

const designerProps = {
  xml: {
    type: String as PropType<string>
  },
  settings: {
    type: Object as PropType<EditorSettings>,
    default: () => defaultSettings
  }
}

const logger = new Logger()

const Designer = defineComponent({
  props: designerProps,
  emits: ['update:xml', 'command-stack-changed'],
  setup(props, { emit }) {
    !window.bpmnInstances && (window.bpmnInstances = {})

    const { settings, xml } = toRefs(props)
    const designer = ref<HTMLDivElement | null>(null)

    const useCamundaPenal = computed(() => settings.value.penalMode !== 'custom')

    const additionalModules = computed<any[]>(() => {
      const modules: any[] = []
      modules.push(translate)
      modules.push(simulationModeler)
      return modules
    })

    const moddleExtensions = computed<Object>(() => {
      return {}
    })

    // 将字符串转换成图显示出来
    const createNewDiagram = async function (newXml) {
      try {
        const { processId, processName, processEngine } = settings.value
        const newId: string = processId ? processId : `Process_${new Date().getTime()}`
        const newName: string = processName || `业务流程_${new Date().getTime()}`
        const xmlString = newXml || xml.value || EmptyXML(newId, newName, processEngine)
        const { modeler } = window.bpmnInstances
        const { warnings } = await modeler.importXML(xmlString)
        if (warnings && warnings.length) {
          warnings.forEach((warn) => console.warn(warn))
        }
      } catch (e) {
        console.error(`[Process Designer Warn]: ${typeof e === 'string' ? e : (e as Error)?.message}`)
      }
    }
    // 初始化建模器
    const initModeler = (penalMode) => {
      window?.bpmnInstances?.modeler && (window.bpmnInstances = {})
      const options: ModelerOptions<Element> = {
        container: designer.value as HTMLElement,
        keyboard: {
          bindTo: designer.value as HTMLElement
        },
        additionalModules: additionalModules.value || [],
        moddleExtensions: moddleExtensions.value || {}
      }
      if (penalMode !== 'custom') {
        options.propertiesPanel = { parent: '#camunda-penal' }
        options.additionalModules.push(
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
          CamundaExtensionModule
        )
        options.moddleExtensions.camunda = camundaModdleDescriptors
      }
      const modeler = (window.bpmnInstances.modeler = new Modeler(options))
      EventEmitter.instance.emit('modeler-init', modeler)
      logger.prettyPrimary('[Process Designer Modeler]', modeler)

      modeler.on('commandStack.changed', async (event) => {
        try {
          const { xml } = await modeler.saveXML({ format: true })
          emit('update:xml', xml)
          emit('command-stack-changed', event)
        } catch (error) {
          console.error(error)
        }
      })

      createNewDiagram(xml.value)
    }

    watch(
      () => settings.value.penalMode,
      () => nextTick().then(() => initModeler(settings.value.penalMode)),
      { immediate: true }
    )
    // watchEffect(() => {
    //   nextTick().then(() => initModeler(settings.value.penalMode))
    // })

    // onMounted(() => initModeler(useCamundaPenal.value))

    return () => <div ref={designer} class="designer"></div>
  }
})

export default Designer
