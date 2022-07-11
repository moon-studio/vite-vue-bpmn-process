// 右键扩展
import Modeler from 'bpmn-js/lib/Modeler'
import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
import { Base } from 'diagram-js/lib/model'
import Canvas from 'diagram-js/lib/core/Canvas'
import { isAny } from 'bpmn-js/lib/util/ModelUtil'
import editor from '@/store/editor'

export default function (modeler: Modeler) {
  const config = editor().getEditorConfig
  const engine = editor().getProcessEngine
  if (config.contextmenu && engine === 'camunda') {
    modeler.on('element.contextmenu', 2000, (event) => {
      event.preventDefault()
      const { element, originalEvent } = event
      if (isAny(element, ['bpmn:Process', 'bpmn:Collaboration', 'bpmn:Participant'])) {
        if (config.templateChooser) {
          const connectorsExtension: any = modeler.get('connectorsExtension')
          connectorsExtension.createAnything(originalEvent, {
            x: originalEvent.clientX,
            y: originalEvent.clientY
          })
        }
      } else {
        config.templateChooser
          ? openEnhancementPopupMenu(modeler, element)
          : openPopupMenu(modeler, element)
      }
    })
  }
}

// default replace popupMenu
function openPopupMenu(modeler: Modeler, element: Base) {
  const popupMenu: PopupMenu = modeler.get('popupMenu')
  if (popupMenu && !popupMenu.isEmpty(element, 'bpmn-replace')) {
    popupMenu.open(element, 'bpmn-replace', {
      cursor: {
        x: getReplaceMenuPosition(element, modeler).x || element.x + element.width,
        y: getReplaceMenuPosition(element, modeler).y || element.y + element.height
      }
    })
    // 设置点击事件清除
    const canvas = modeler.get<Canvas>('canvas')
    const container = canvas.getContainer()
    const closePopupMenu = () => popupMenu && popupMenu.close()
    container.addEventListener('click', closePopupMenu)
  }
}

// templateChooser enhancement replace popupMenu
function openEnhancementPopupMenu(modeler: Modeler, element: Base) {
  const replaceMenu: any = modeler.get('replaceMenu')
  if (replaceMenu) {
    replaceMenu.open(element, {
      x: element.x + element.width,
      y: element.y + element.height
    })
    const canvas = modeler.get<Canvas>('canvas')
    const container = canvas.getContainer()
    const closePopupMenu = () => replaceMenu && replaceMenu.close()
    container.addEventListener('click', closePopupMenu)
  }
}

///// utils
function getReplaceMenuPosition(element, modeler) {
  const canvas = modeler.get('canvas')
  const Y_OFFSET = 5

  const diagramContainer = canvas.getContainer()
  const diagramRect = diagramContainer.getBoundingClientRect()

  const top = element.y + element.height + diagramRect.top
  const left = element.x + element.width - diagramRect.left

  return {
    x: left,
    y: top + Y_OFFSET
  }
}
