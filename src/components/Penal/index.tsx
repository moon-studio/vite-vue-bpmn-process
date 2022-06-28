import { defineComponent, markRaw, ref } from 'vue'
import { NCollapse } from 'naive-ui'
import { Base, Connection, Label, Shape } from 'diagram-js/lib/model'
import { Translate } from 'diagram-js/lib/i18n/translate'
import debounce from 'lodash.debounce'

import EventEmitter from '@/utils/EventEmitter'
import modelerStore from '@/store/modeler'
import Logger from '@/utils/Logger'

import { isAsynchronous } from '@/bo-utils/asynchronousContinuationsUtil'
import { isExecutable } from '@/bo-utils/executionListenersUtil'
import { isExternalTask } from '@/bo-utils/externalTaskUtil'

import ElementGenerations from './components/ElementGenerations.vue'
import ElementDocumentations from './components/ElementDocumentations.vue'
import ElementExecutionListeners from './components/ElementExecutionListeners.vue'
import ElementExtensionProperties from './components/ElementExtensionProperties.vue'
import ElementExternalTask from './components/ElementExternalTask.vue'
import ElementAsyncContinuations from './components/ElementAsyncContinuations.vue'

const Penal = defineComponent({
  name: 'Penal',
  setup() {
    const modeler = modelerStore()
    const penal = ref<HTMLDivElement | null>(null)
    const currentElementId = ref<string | undefined>(undefined)
    const currentElementType = ref<string | undefined>(undefined)

    const penalTitle = ref<string | undefined>('属性配置')

    EventEmitter.on('modeler-init', (modeler) => {
      // 导入完成后默认选中 process 节点
      modeler.on('import.done', () => {
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
    const setCurrentElement = debounce((element: Shape | Base | Connection | Label | null) => {
      let activatedElement: BpmnElement | null | undefined = element
      if (!activatedElement) {
        activatedElement =
          modeler.getElRegistry?.find((el) => el.type === 'bpmn:Process') ||
          modeler.getElRegistry?.find((el) => el.type === 'bpmn:Collaboration')

        if (!activatedElement) {
          return Logger.prettyError('No Element found!')
        }
      }
      modeler.setElement(markRaw(activatedElement), activatedElement.id)
      currentElementId.value = activatedElement.id
      currentElementType.value = activatedElement.type.split(':')[1]
      penalTitle.value = modeler.getModeler?.get<Translate>('translate')(currentElementType.value)
      Logger.prettyPrimary(
        'Selected element changed',
        `ID: ${activatedElement.id} , type: ${activatedElement.type}`
      )
      Logger.prettyInfo('Selected element businessObject', activatedElement.businessObject)
    }, 100)

    return () => (
      <div ref={penal} class="penal">
        <NCollapse arrow-placement="right">
          <ElementGenerations></ElementGenerations>
          <ElementDocumentations></ElementDocumentations>
          {isExternalTask(modeler.getActive!) && <ElementExternalTask></ElementExternalTask>}
          <ElementExtensionProperties></ElementExtensionProperties>
          {isExecutable(modeler.getActive!) && (
            <ElementExecutionListeners></ElementExecutionListeners>
          )}
          {isAsynchronous(modeler.getActive!) && (
            <ElementAsyncContinuations></ElementAsyncContinuations>
          )}
        </NCollapse>
      </div>
    )
  }
})

export default Penal
