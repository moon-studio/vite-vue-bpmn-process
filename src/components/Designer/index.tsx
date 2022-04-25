import { computed, defineComponent, onMounted, PropType, ref, toRefs, Teleport, watchEffect } from 'vue'
import Modeler from 'bpmn-js/lib/Modeler'
import EmptyXML from '@/utils/EmptyXML'
import EventEmitter from '@/utils/EventEmitter'
import Logger from '@/utils/Logger'

import translate from '@/components/Moddles/Translate'
import simulationModeler from 'bpmn-js-token-simulation'
import { ViewerOptions } from 'diagram-js/lib/model'
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import CamundaExtensionModule from 'camunda-bpmn-moddle/lib'
import camundaModdleDescriptors from 'camunda-bpmn-moddle/resources/camunda.json'
import { EditorSettings } from '../../../types/editor/settings'
import { defaultSettings } from '@/config'

const designerProps = {
  xml: {
    type: String as PropType<string | undefined>,
    default: EmptyXML('process_1', '流程图1.0')
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
    const designer = ref<HTMLDivElement | null>(null)
    const camundaPenal = ref<HTMLDivElement | null>(null)
    const { settings, xml } = toRefs(props)

    const useCamundaPenal = computed(() => settings.value.penalMode !== 'custom')

    const additionalModules = computed(() => {
      const modules: any[] = []
      modules.push(translate)
      modules.push(simulationModeler)
      return modules
    })

    const moddleExtensions = computed(() => {
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
    const initModeler = (penal) => {
      console.log(useCamundaPenal.value)
      window?.bpmnInstances?.modeler && (window.bpmnInstances = {})
      const options: ViewerOptions<Element> = {
        container: designer.value as HTMLElement,
        keyboard: {
          bindTo: designer.value as HTMLElement
        },
        additionalModules: additionalModules.value || [],
        moddleExtensions: moddleExtensions.value || {}
      }
      if (penal) {
        options.propertiesPanel = { parent: '#camundaPenal' }
        // @ts-ignore 上面已强制赋值为 {}, 可直接赋值
        options.additionalModules.push(
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          CamundaPlatformPropertiesProviderModule,
          CamundaExtensionModule
        )
        // @ts-ignore 上面已强制赋值为 {}, 可直接赋值
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

    watchEffect(() => {
      if (!designer.value) {
        return undefined
      }
      initModeler(camundaPenal.value)
    })

    onMounted(() => initModeler(camundaPenal.value))

    return () => (
      <div ref={designer} class="designer">
        {useCamundaPenal.value && (
          <Teleport to=".designer-container">
            <div ref={camundaPenal} class="camunda-penal" id="camundaPenal"></div>
          </Teleport>
        )}
      </div>
    )
  }
})

export default Designer
