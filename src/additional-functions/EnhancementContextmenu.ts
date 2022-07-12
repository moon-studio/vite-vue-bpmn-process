// 右键扩展
import Modeler from 'bpmn-js/lib/Modeler'
import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
import { Base } from 'diagram-js/lib/model'
import Canvas, { Position } from 'diagram-js/lib/core/Canvas'
import { isAny } from 'bpmn-js/lib/util/ModelUtil'
import editor from '@/store/editor'
import ContextPad from 'diagram-js/lib/features/context-pad/ContextPad'

export default function (modeler: Modeler) {
  const config = editor().getEditorConfig
  if (!config.contextmenu) return
  modeler.on('element.contextmenu', 2000, (event) => {
    const { element, originalEvent } = event
    console.log('originalEvent', originalEvent)
    if (
      isAny(element, ['bpmn:Process', 'bpmn:Collaboration', 'bpmn:Participant', 'bpmn:SubProcess'])
    ) {
      if (config.templateChooser) {
        const connectorsExtension: any = modeler.get('connectorsExtension')
        connectorsExtension &&
          connectorsExtension.createAnything(originalEvent, getContextMenuPosition(originalEvent))
      }
    } else {
      config.templateChooser
        ? openEnhancementPopupMenu(modeler, element, originalEvent)
        : openPopupMenu(modeler, element, originalEvent)
    }
  })
}

// default replace popupMenu
function openPopupMenu(modeler: Modeler, element: Base, event: MouseEvent) {
  const contextPad = modeler.get<ContextPad>('contextPad')
  const popupMenu = modeler.get<PopupMenu>('popupMenu')
  if (popupMenu && !popupMenu.isEmpty(element, 'bpmn-replace')) {
    popupMenu.isOpen() && popupMenu.close()
    const { left: x, top: y } = contextPad._getPosition(element).position
    popupMenu.open(element, 'bpmn-replace', { cursor: { x, y } })
    // 设置画布点击清除事件
    const canvas = modeler.get<Canvas>('canvas')
    const container = canvas.getContainer()
    const closePopupMenu = () => {
      if (popupMenu && popupMenu.isOpen()) {
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
