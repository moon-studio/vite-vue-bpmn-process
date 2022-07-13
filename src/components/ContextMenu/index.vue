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
          <span @click="triggerAction(item, $event)">{{ translateCh(item.label) }}</span>
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
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import EventEmitter from '@/utils/EventEmitter'
  import { Base } from 'diagram-js/lib/model'
  import { customTranslate } from '@/additional-modules/Translate'
  import BpmnReplaceOptions from '@/utils/BpmnReplaceOptions'
  import { isAppendAction } from '@/utils/BpmnDesignerUtils'
  import contextMenuActions from '@/components/ContextMenu/contextMenuActions'

  const translateCh = customTranslate

  const showPopover = ref(false)
  const x = ref(0)
  const y = ref(0)

  const currentReplaceOptions = ref<any[]>([])

  let mouseEvent: MouseEvent | null = null
  let currentElement: Base | null = null
  const isAppend = ref<boolean>(false)
  const contextMenuTitle = ref<string>('创建元素')

  const { appendAction, replaceAction } = contextMenuActions()

  const triggerAction = (entry, event) => {
    try {
      isAppend.value
        ? appendAction(entry.target, event)
        : replaceAction(entry.target, currentElement)
      showPopover.value = false
    } catch (e) {
      console.error(e)
    }
  }

  const initEventCallback = (event: MouseEvent, element?: Base) => {
    x.value = event.clientX
    y.value = event.clientY
    mouseEvent = event
    currentElement = element || null
    isAppend.value = isAppendAction(element)
    currentReplaceOptions.value = BpmnReplaceOptions(element)
    contextMenuTitle.value = isAppend.value ? '创建元素' : '更改元素'
    showPopover.value = true
  }

  const closePopover = () => (showPopover.value = false)

  onMounted(() => {
    EventEmitter.on('show-contextmenu', initEventCallback)
    document.body.addEventListener('click', closePopover)
  })

  onBeforeUnmount(() => {
    EventEmitter.removeListener('show-contextmenu', initEventCallback)
    document.body.removeEventListener('click', closePopover)
  })
</script>
