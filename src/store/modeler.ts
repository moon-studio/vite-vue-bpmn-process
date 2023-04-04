import { defineStore } from 'pinia'
import type { Moddle } from 'moddle'
import type { Base } from 'diagram-js/lib/model'
import type Modeler from 'bpmn-js/lib/Modeler'
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling'
import type Canvas from 'diagram-js/lib/core/Canvas'
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry'

type ModelerStore = {
  activeElement: Base | undefined
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
    getModeling: (state) => state.modeling,
    getCanvas: (state) => state.canvas,
    getElRegistry: (state) => state.elementRegistry
  },
  actions: {
    setModeler(modeler) {
      this.modeler = modeler
    },
    setModules<K extends keyof ModelerStore>(key: K, module) {
      this[key] = module
    },
    setElement(element: Base, id: string) {
      this.activeElement = element
      this.activeElementId = id
    }
  }
})
