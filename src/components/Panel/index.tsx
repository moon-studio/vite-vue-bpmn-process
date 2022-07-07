import { defineComponent, markRaw, ref } from 'vue'
import { NCollapse } from 'naive-ui'
import { Base, Connection, Label, Shape } from 'diagram-js/lib/model'
import { Translate } from 'diagram-js/lib/i18n/translate'
import debounce from 'lodash.debounce'

import EventEmitter from '@/utils/EventEmitter'
import modelerStore from '@/store/modeler'
import Logger from '@/utils/Logger'

import getBpmnIconType from '@/bpmn-icons/getIconType'
import bpmnIcons from '@/bpmn-icons'
import BpmnIcon from '@/components/common/BpmnIcon.vue'

import { isAsynchronous } from '@/bo-utils/asynchronousContinuationsUtil'
import { isExecutable } from '@/bo-utils/executionListenersUtil'
import { isJobExecutable } from '@/bo-utils/jobExecutionUtil'
import { isStartInitializable } from '@/bo-utils/initiatorUtil'

import ElementGenerations from './components/ElementGenerations.vue'
import ElementConditional from './components/ElementConditional.vue'
import ElementDocumentations from './components/ElementDocumentations.vue'
import ElementExecutionListeners from './components/ElementExecutionListeners.vue'
import ElementExtensionProperties from './components/ElementExtensionProperties.vue'
import ElementAsyncContinuations from './components/ElementAsyncContinuations.vue'
import ElementJobExecution from './components/ElementJobExecution.vue'
import ElementStartInitiator from './components/ElementStartInitiator.vue'
import { isCanbeConditional } from '@/bo-utils/conditionUtil'
import { customTranslate } from '@/additional-modules/Translate'

const Panel = defineComponent({
  name: 'Panel',
  setup() {
    const modeler = modelerStore()
    const panel = ref<HTMLDivElement | null>(null)
    const currentElementId = ref<string | undefined>(undefined)
    const currentElementType = ref<string | undefined>(undefined)

    const penalTitle = ref<string | undefined>('属性配置')
    const bpmnIconName = ref<string>('Process')
    const bpmnElementName = ref<string>('Process')

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

      modeler.on('element.click', (event) => {
        Logger.prettyInfo('Element Click', event)
      })
    })

    // 设置选中元素，更新 store
    const setCurrentElement = debounce((element: Shape | Base | Connection | Label | null) => {
      let activatedElement: BpmnElement | null | undefined = element
      let activatedElementTypeName = ''

      if (!activatedElement) {
        activatedElement =
          modeler.getElRegistry?.find((el) => el.type === 'bpmn:Process') ||
          modeler.getElRegistry?.find((el) => el.type === 'bpmn:Collaboration')

        if (!activatedElement) {
          return Logger.prettyError('No Element found!')
        }
      }
      activatedElementTypeName = getBpmnIconType(activatedElement)

      modeler.setElement(markRaw(activatedElement), activatedElement.id)
      currentElementId.value = activatedElement.id
      currentElementType.value = activatedElement.type.split(':')[1]

      penalTitle.value = modeler.getModeler?.get<Translate>('translate')(currentElementType.value)
      bpmnIconName.value = bpmnIcons[activatedElementTypeName]
      bpmnElementName.value = activatedElementTypeName

      EventEmitter.emit('element-update', activatedElement)

      Logger.prettyPrimary(
        'Selected element changed',
        `ID: ${activatedElement.id} , type: ${activatedElement.type}`
      )
      Logger.prettyInfo('Selected element businessObject', activatedElement.businessObject)
    }, 100)

    return () => (
      <div ref={panel} class="panel">
        <div class="panel-header">
          <BpmnIcon name={bpmnIconName.value}></BpmnIcon>
          <p>{bpmnElementName.value}</p>
          <p>{customTranslate(currentElementType.value || 'Process')}</p>
        </div>
        {currentElementId.value && currentElementId.value.length && (
          <NCollapse arrow-placement="right">
            <ElementGenerations></ElementGenerations>
            <ElementDocumentations></ElementDocumentations>
            {isCanbeConditional(modeler.getActive!) && <ElementConditional></ElementConditional>}
            {isJobExecutable(modeler.getActive!) && <ElementJobExecution></ElementJobExecution>}
            <ElementExtensionProperties></ElementExtensionProperties>
            {isExecutable(modeler.getActive!) && (
              <ElementExecutionListeners></ElementExecutionListeners>
            )}
            {isAsynchronous(modeler.getActive!) && (
              <ElementAsyncContinuations></ElementAsyncContinuations>
            )}
            {isStartInitializable(modeler.getActive!) && (
              <ElementStartInitiator></ElementStartInitiator>
            )}
          </NCollapse>
        )}
      </div>
    )
  }
})

export default Panel
