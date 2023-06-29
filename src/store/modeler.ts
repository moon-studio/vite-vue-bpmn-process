import { defineStore } from 'pinia'
import type { Moddle } from 'moddle'
import type Modeler from 'bpmn-js/lib/Modeler'
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import type Canvas from 'diagram-js/lib/core/Canvas'
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry'

type ModelerStore = {
  activeElement: BpmnElement | undefined
  activeElementId: string | undefined
  modeler: Modeler | undefined
  moddle: Moddle | undefined
  modeling: Modeling | undefined
  canvas: Canvas | undefined
  elementRegistry: ElementRegistry | undefined
}

const defaultState: ModelerStore = {
  activeElement: undefined,
  activeElementId: undefined,
  modeler: undefined,
  moddle: undefined,
  modeling: undefined,
  canvas: undefined,
  elementRegistry: undefined
}

export default defineStore('modeler', {
  state: (): ModelerStore => defaultState,
  getters: {
    getActive: (state) => state.activeElement,
    getActiveId: (state) => state.activeElementId,
    getModeler: (state) => state.modeler,
    getModdle: (state) => state.moddle,
    getModeling: (state): Modeling | undefined => state.modeling,
    getCanvas: (state): Canvas | undefined => state.canvas,
    getElRegistry: (state) => state.elementRegistry
  },
  actions: {
    setModeler(modeler: Modeler | undefined) {
      this.modeler = modeler
      if (modeler) {
        this.modeling = modeler.get<Modeling>('modeling')
        this.moddle = modeler.get<Moddle>('moddle')
        this.canvas = modeler.get<Canvas>('canvas')
        this.elementRegistry = modeler.get<ElementRegistry>('elementRegistry')
      } else {
        this.modeling = this.moddle = this.canvas = this.elementRegistry = undefined
      }
    },
    setElement(element: BpmnElement | undefined) {
      this.activeElement = element
      this.activeElementId = element?.id
    }
  }
})
