// 右键扩展
import editor from '@/store/editor'
import EventEmitter from '@/utils/EventEmitter'
import { isAppendAction } from '@/utils/BpmnDesignerUtils'

import type Modeler from 'bpmn-js/lib/Modeler'
import type PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
import type { Element } from 'diagram-js/lib/model/Types'
import type Canvas from 'diagram-js/lib/core/Canvas'
import type { Point } from 'diagram-js/lib/util/Types'
import type { Event } from 'diagram-js/lib/core/EventBus'

type ContextMenuEvent = {
  element: Element
  originalEvent: MouseEvent
} & Event

export default function (modeler: Modeler) {
  const config = editor().getEditorConfig
  if (!config.contextmenu) return
  modeler.on('element.contextmenu', 2000, (event: ContextMenuEvent) => {
    const { element, originalEvent } = event

    // 自定义右键菜单
    if (config.customContextmenu) {
      return EventEmitter.emit('show-contextmenu', originalEvent, element)
    }

    // 原生面板扩展
    // 1. 更改元素类型
    // ts-ignore
    if (!isAppendAction(element)) {
      return config.templateChooser
        ? openEnhancementPopupMenu(modeler, element, originalEvent)
        : openPopupMenu(modeler, element, originalEvent)
    }
    // 2. 创建新元素 (仅开始模板扩展时可以)
    if (!config.templateChooser) return
    const connectorsExtension: any = modeler.get('connectorsExtension')
    connectorsExtension &&
      connectorsExtension.createAnything(originalEvent, getContextMenuPosition(originalEvent))
  })
}

// default replace popupMenu
function openPopupMenu(modeler: Modeler, element: Element, event: MouseEvent) {
  const popupMenu = modeler.get<PopupMenu>('popupMenu')
  if (popupMenu && !popupMenu.isEmpty(element, 'bpmn-replace')) {
    popupMenu.open(element, 'bpmn-replace', { x: event.clientX + 10, y: event.clientY + 10 })
    // 设置画布点击清除事件
    const canvas = modeler.get<Canvas>('canvas')
    const container = canvas.getContainer()
    const closePopupMenu = (ev) => {
      if (popupMenu && popupMenu.isOpen() && ev.delegateTarget.tagName === 'svg') {
        popupMenu.close()
        container.removeEventListener('click', closePopupMenu)
      }
    }
    container.addEventListener('click', closePopupMenu)
  }
}

// templateChooser enhancement replace popupMenu
function openEnhancementPopupMenu(modeler: Modeler, element: Element, event: MouseEvent) {
  const replaceMenu: any = modeler.get('replaceMenu')
  if (replaceMenu) {
    replaceMenu.open(element, getContextMenuPosition(event, true))
  }
}

///// utils
function getContextMenuPosition(event: MouseEvent, offset?: boolean): Point {
  return {
    x: event.clientX + (offset ? 10 : 0),
    y: event.clientY + (offset ? 25 : 0)
  }
}
