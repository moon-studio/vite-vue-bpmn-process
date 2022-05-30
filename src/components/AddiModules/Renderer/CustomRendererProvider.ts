import BpmnRenderer, { RendererHandler, RendererType } from 'bpmn-js/lib/draw/BpmnRenderer'
import EventBus from 'diagram-js/lib/core/EventBus'
import Styles from 'diagram-js/lib/draw/Styles'
import PathMap from 'bpmn-js/lib/draw/PathMap'
import Canvas from 'diagram-js/lib/core/Canvas'
import TextRenderer from 'bpmn-js/lib/draw/TextRenderer'
import { isObject } from 'min-dash'
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg'

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

    this.handlers['bpmn:StartEvent'] = (parentGfx, element, attrs) => {
      if (!attrs || !attrs['fillOpacity']) {
        !attrs && (attrs = {})

        attrs['fillOpacity'] = 1
      }

      return this.drawCircle(parentGfx, element.width, element.height, attrs)
    }
  }

  private drawCircle(parentGfx, width, height, offset, attrs?) {
    if (isObject(offset)) {
      attrs = offset
      offset = 0
    }

    offset = offset || 0

    attrs = this._styles.computeStyle(attrs, {
      stroke: '#1d286f',
      strokeWidth: 2,
      fill: '#2bcd64'
    })

    if (attrs.fill === 'none') {
      delete attrs.fillOpacity
    }

    const cx = width / 2,
      cy = height / 2

    const circle = svgCreate('circle')
    svgAttr(circle, {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4 - offset)
    })
    svgAttr(circle, attrs)

    svgAppend(parentGfx, circle)

    return circle
  }
}
