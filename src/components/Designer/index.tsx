import { computed, defineComponent, onMounted, PropType, ref, toRefs } from 'vue'
import Modeler from 'bpmn-js/lib/Modeler'
import EmptyXML from '@/utils/EmptyXML'
import EventEmitter from '@/utils/EventEmitter'
import Logger from '@/utils/Logger'

import translate from '@/components/Moddles/Translate'
import simulationModeler from 'bpmn-js-token-simulation'

const designerProps = {
  xml: {
    type: String as PropType<string | undefined>,
    default: EmptyXML('process_1', '流程图1.0')
  },
  processId: {
    type: String as PropType<string | undefined>,
    default: undefined
  },
  processName: {
    type: String as PropType<string | undefined>,
    default: undefined
  },
  prefix: {
    type: String as PropType<string | undefined>,
    default: undefined
  }
}

const logger = new Logger()

const Designer = defineComponent({
  props: designerProps,
  emits: ['update:xml', 'command-stack-changed'],
  setup(props, { emit }) {
    !window.bpmnInstances && (window.bpmnInstances = {})
    const designer = ref<HTMLDivElement | null>(null)
    const { processId, processName, prefix, xml } = toRefs(props)

    const additionalModules = computed(() => {
      const modules: any[] = []
      modules.push(translate)
      modules.push(simulationModeler)
      return modules
    }).value

    const moddleExtensions = computed(() => {
      return {}
    }).value

    // 将字符串转换成图显示出来
    const createNewDiagram = async function (newXml) {
      try {
        const newId: string = processId.value ? processId.value : `Process_${new Date().getTime()}`
        const newName: string = processName.value || `业务流程_${new Date().getTime()}`
        const xmlString = newXml || xml.value || EmptyXML(newId, newName, prefix.value)
        const { modeler } = window.bpmnInstances
        const { warnings } = await modeler.importXML(xmlString)
        if (warnings && warnings.length) {
          warnings.forEach((warn) => console.warn(warn))
        }
      } catch (e) {
        console.error(`[Process Designer Warn]: ${typeof e === 'string' ? e : (e as Error)?.message}`)
      }
    }

    onMounted(() => {
      const modeler = (window.bpmnInstances.modeler = new Modeler({
        container: designer.value as HTMLElement,
        keyboard: {
          bindTo: designer.value as HTMLElement
        },
        additionalModules,
        moddleExtensions
      }))
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
    })

    return () => <div ref={designer} class="process-designer"></div>
  }
})

export default Designer
