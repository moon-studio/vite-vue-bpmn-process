import { defineStore } from 'pinia'
import { Moddle } from 'moddle'
import { Base } from 'diagram-js/lib/model'
import Modeler from 'bpmn-js/lib/Modeler'
import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js'
import Canvas from 'diagram-js/lib/core/Canvas'
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'

type ModelerStore = {
  activeElement: Base | undefined
  activeElementId: string | undefined
  modeler: Modeler | null
  moddle: Moddle | null
  modeling: Modeling | null
  canvas: Canvas | null
  elementRegistry: ElementRegistry | null
}

const defaultState: ModelerStore = {
  activeElement: undefined,
  activeElementId: undefined,
  modeler: null,
  moddle: null,
  modeling: null,
  canvas: null,
  elementRegistry: null
}

export default defineStore('modeler', {
  state: () => defaultState,
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
