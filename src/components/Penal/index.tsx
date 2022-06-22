import { defineComponent, markRaw, ref } from 'vue'
import { NCollapse } from 'naive-ui'
import { Base, Connection, Label, Shape } from 'diagram-js/lib/model'
import { Translate } from 'diagram-js/lib/i18n/translate'

import EventEmitter from '@/utils/EventEmitter'
import modelerStore from '@/store/modeler'
import Logger from '@/utils/Logger'

import ElementGenerations from './components/ElementGenerations.vue'
import ElementDocumentations from './components/ElementDocumentations.vue'

const Penal = defineComponent({
  name: 'Penal',
  setup() {
    const store = modelerStore()
    const penal = ref<HTMLDivElement | null>(null)
    const currentElementId = ref<string | undefined>(undefined)
    const currentElementType = ref<string | undefined>(undefined)

    const penalTitle = ref<string | undefined>('属性配置')

    EventEmitter.on('modeler-init', (modeler) => {
      // 导入完成后默认选中 process 节点
      modeler.on('import.done', (e) => {
        setCurrentElement(null)
      })
      // 监听选择事件，修改当前激活的元素以及表单
      modeler.on('selection.changed', ({ newSelection }) => {
        setCurrentElement(newSelection[0] || null)
      })
      modeler.on('element.changed', ({ element }) => {
        // 保证 修改 "默认流转路径" 等类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === currentElementId.value) {
          setCurrentElement(element)
        }
      })
    })

    // 设置选中元素，更新 store
    const setCurrentElement = (element: Shape | Base | Connection | Label | null) => {
      let activatedElement: BpmnElement | null | undefined = element
      if (!activatedElement) {
        activatedElement =
          store.getElRegistry?.find((el) => el.type === 'bpmn:Process') ||
          store.getElRegistry?.find((el) => el.type === 'bpmn:Collaboration')

        if (!activatedElement) {
          return Logger.prettyError('No Element found!')
        }
      }
      store.setElement(markRaw(activatedElement), activatedElement.id)
      currentElementId.value = activatedElement.id
      currentElementType.value = activatedElement.type.split(':')[1]
      penalTitle.value = store.getModeler?.get<Translate>('translate')(currentElementType.value)
      Logger.prettyPrimary(
        'Selected element changed',
        `ID: ${activatedElement.id} , type: ${activatedElement.type}`
      )
      Logger.prettyInfo('Selected element businessObject', activatedElement.businessObject)
    }

    return () => (
      <div ref={penal} class="penal">
        <NCollapse arrow-placement="right" accordion={true}>
          <ElementGenerations></ElementGenerations>
          <ElementDocumentations></ElementDocumentations>
        </NCollapse>
      </div>
    )
  }
})

export default Penal
