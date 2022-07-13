// 右键扩展
import Modeler from 'bpmn-js/lib/Modeler'
import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
import { Base } from 'diagram-js/lib/model'
import Canvas, { Position } from 'diagram-js/lib/core/Canvas'
import editor from '@/store/editor'
import EventEmitter from '@/utils/EventEmitter'
import { isAppendAction } from '@/utils/BpmnDesignerUtils'

export default function (modeler: Modeler) {
  const config = editor().getEditorConfig
  if (!config.contextmenu) return
  modeler.on('element.contextmenu', 2000, (event) => {
    const { element, originalEvent } = event

    // 自定义右键菜单
    if (config.customContextmenu) {
      return EventEmitter.emit('show-contextmenu', originalEvent, element)
    }

    // 原生面板扩展
    // 1. 更改元素类型
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
function openPopupMenu(modeler: Modeler, element: Base, event: MouseEvent) {
  const popupMenu = modeler.get<PopupMenu>('popupMenu')
  if (popupMenu && !popupMenu.isEmpty(element, 'bpmn-replace')) {
    popupMenu.open(element, 'bpmn-replace', {
      cursor: { x: event.clientX + 10, y: event.clientY + 10 }
    })
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
function openEnhancementPopupMenu(modeler: Modeler, element: Base, event: MouseEvent) {
  const replaceMenu: any = modeler.get('replaceMenu')
  if (replaceMenu) {
    replaceMenu.open(element, getContextMenuPosition(event, true))
  }
}

///// utils
function getContextMenuPosition(event: MouseEvent, offset?: boolean): Position {
  return {
    x: event.clientX + (offset ? 10 : 0),
    y: event.clientY + (offset ? 25 : 0)
  }
}
