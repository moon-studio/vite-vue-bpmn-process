import { defineComponent, ref } from 'vue'
import { NCard } from 'naive-ui'
import EventEmitter from '@/utils/EventEmitter'
import { Base, Connection, Label, ModdleElement, Shape } from 'diagram-js/lib/model'
import Logger from '@/utils/Logger'

const Penal = defineComponent({
  setup() {
    const penal = ref<HTMLDivElement | null>(null)

    const currentElementId = ref<string | undefined>(undefined)
    const currentElementType = ref<string | undefined>(undefined)
    const currentElementBO = ref<ModdleElement | null>(null)

    EventEmitter.instance.on('modeler-init', (modeler) => {
      initBpmnModules(modeler)
      modeler.on('import.done', (e) => {
        setCurrentElement(null)
      })
      // 监听选择事件，修改当前激活的元素以及表单
      modeler.on('selection.changed', ({ newSelection }) => {
        setCurrentElement(newSelection[0] || null)
      })
      modeler.on('element.changed', ({ element }) => {
        // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === currentElementId.value) {
          setCurrentElement(element)
        }
      })
    })

    const initBpmnModules = (modeler) => {
      window.bpmnInstances.elementRegistry = modeler.get('elementRegistry')
      window.bpmnInstances.eventBus = modeler.get('eventBus')
      window.bpmnInstances.modeling = modeler.get('modeling')
      window.bpmnInstances.moddle = modeler.get('moddle')
      window.bpmnInstances.replace = modeler.get('replace')
      window.bpmnInstances.selection = modeler.get('selection')
    }

    const setCurrentElement = (element: Shape | Base | Connection | Label | null) => {
      let activatedElement: Shape | Base | Connection | Label | null = element
      if (!activatedElement) {
        activatedElement =
          window.bpmnInstances.elementRegistry.find((el) => el.type === 'bpmn:Process') ??
          window.bpmnInstances.elementRegistry.find((el) => el.type === 'bpmn:Collaboration')
        if (!activatedElement) {
          return Logger.prettyError('No Element found!')
        }
      }
      window.bpmnInstances.currentElement = activatedElement
      currentElementId.value = activatedElement.id
      currentElementType.value = activatedElement.type
      currentElementBO.value = activatedElement.businessObject
      Logger.printBack(
        'primary',
        `select element changed: id: ${activatedElement.id} , type: ${activatedElement.type}`
      )
      Logger.prettyInfo('businessObject', activatedElement.businessObject)
    }

    return () => (
      <div ref={penal} class="penal">
        <NCard
          title="属性配置"
          segmented={{ content: true, footer: 'soft' }}
          v-slots={{
            default: () => <div>卡片内容</div>
          }}
        ></NCard>
      </div>
    )
  }
})

export default Penal
