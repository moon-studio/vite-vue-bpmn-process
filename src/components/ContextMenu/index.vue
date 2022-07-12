<template>
  <n-popover
    :show="showPopover"
    :x="x"
    :y="y"
    :show-arrow="false"
    trigger="manual"
    placement="right-start"
  >
    <div class="bpmn-context-menu">
      <div class="context-menu_header">{{ contextMenuTitle }}</div>
      <div class="context-menu_body">
        <div v-for="item in currentReplaceOptions" :key="item.actionName" class="context-menu_item">
          <i :class="`context-menu_item_icon ${item.className}`"></i>
          <span @click="triggerAction(item)">{{ translateCh(item.label) }}</span>
        </div>
      </div>
    </div>
  </n-popover>
</template>

<script lang="ts" setup>
  /**
   * @direction 自定义右键菜单
   * @author MiyueFE
   * @date 2022/7/11
   */
  import { onMounted, ref } from 'vue'
  import modeler from '@/store/modeler'
  import EventEmitter from '@/utils/EventEmitter'
  import { Base } from 'diagram-js/lib/model'
  import BpmnReplace from 'bpmn-js/lib/features/replace/BpmnReplace'
  import { customTranslate } from '@/additional-modules/Translate'
  import BpmnReplaceOptions from '@/utils/BpmnReplaceOptions'
  import { isAny } from 'bpmn-js/lib/util/ModelUtil'
  import Create from 'diagram-js/lib/features/create/Create'
  import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'
  import { isAppendAction } from '@/utils/BpmnDesignerUtils'

  const showPopover = ref(false)
  const x = ref(0)
  const y = ref(0)

  const modelerStore = modeler()
  const currentReplaceOptions = ref<any[]>([])

  const translateCh = customTranslate

  let mouseEvent: MouseEvent | null = null
  let currentElement: Base | null = null
  const isAppend = ref<boolean>(false)
  const contextMenuTitle = ref<string>('创建元素')

  const replaceAction = (target) => {
    const replaceElement = modelerStore.getModeler!.get<BpmnReplace>('bpmnReplace').replaceElement
    replaceElement(currentElement!, target)
  }
  const appendAction = (target) => {
    const elementFactory = modelerStore.getModeler!.get<ElementFactory>('elementFactory')
    const create: Create = modelerStore.getModeler!.get('create')
    const shape = elementFactory.createShape(target)
    if (target.isExpanded != null) {
      shape.businessObject.di.isExpanded = target.isExpanded
    }
    create.start(mouseEvent!, shape)
  }
  const triggerAction = (entry) => {
    isAppend.value ? appendAction(entry.target) : replaceAction(entry.target)
  }

  onMounted(() => {
    EventEmitter.on('show-contextmenu', (event: MouseEvent, element?: Base) => {
      x.value = event.clientX
      y.value = event.clientY
      mouseEvent = event
      currentElement = element || null
      isAppend.value = isAppendAction(element)
      currentReplaceOptions.value = BpmnReplaceOptions(element)
      contextMenuTitle.value = isAppend.value ? '创建元素' : '更改元素'
      showPopover.value = true
    })
    document.body.addEventListener('click', () => (showPopover.value = false))
  })
</script>

<style lang="scss" scoped>
  .bpmn-context-menu {
    display: flex;
    width: 400px;
    max-height: 360px;
    overflow: hidden;
    flex-direction: column;
    .context-menu_header {
      line-height: 40px;
      font-size: 16px;
      font-weight: bold;
      border-bottom: 1px solid rgb(239, 239, 245);
    }
    .context-menu_body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      overflow-y: auto;
    }
    .context-menu_item {
      width: 100%;
      height: 32px;
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
      padding: 0 4px;
      display: flex;
      align-items: center;
      &:hover {
        background-color: rgb(241, 242, 244);
      }
      .context-menu_item_icon {
        font-size: 20px;
        margin-right: 8px;
      }
    }
  }
</style>
