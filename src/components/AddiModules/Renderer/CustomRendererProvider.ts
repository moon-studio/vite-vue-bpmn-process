import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer'
import EventBus from 'diagram-js/lib/core/EventBus'
import Styles from 'diagram-js/lib/draw/Styles'
import PathMap from 'bpmn-js/lib/draw/PathMap'
import Canvas from 'diagram-js/lib/core/Canvas'
import TextRenderer from 'bpmn-js/lib/draw/TextRenderer'
import renderEventContent from '@/components/AddiModules/Renderer/renderEventContent'
import { drawCircle, drawPath } from '@/components/AddiModules/Renderer/utils'

export default class CustomRendererProvider extends BpmnRenderer {
  _styles: Styles
  constructor(
    config: any,
    eventBus: EventBus,
    styles: Styles,
    pathMap: PathMap,
    canvas: Canvas,
    textRenderer: TextRenderer
  ) {
    super(config, eventBus, styles, pathMap, canvas, textRenderer, 3000)

    this._styles = styles

    // 重点！！！在这里执行重绘
    this.handlers['bpmn:Event'] = (parentGfx, element, attrs) => {
      if (!attrs || !attrs['fillOpacity']) {
        !attrs && (attrs = {})
        attrs['fillOpacity'] = 1
        attrs['fill'] = '#1bbc9d'
        attrs['strokeWidth'] = 0
      }
      return drawCircle(this, parentGfx, element.width, element.height, attrs)
    }
    this.handlers['bpmn:EndEvent'] = (parentGfx, element, attrs) => {
      const circle = this.handlers['bpmn:Event'](parentGfx, element, {
        fillOpacity: 1,
        strokeWidth: 2,
        fill: '#e98885',
        stroke: '#000000'
      })
      renderEventContent(this.handlers, element, parentGfx)
      return circle
    }
  }
}
