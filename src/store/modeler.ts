import { defineStore } from 'pinia'
import Modeler from 'bpmn-js/lib/Modeler'

type ModelerStore = {
  modeler: Modeler | null
  moddle: Modeler | null
  modeling: Modeler | null
  canvas: Modeler | null
  elementRegistry: Modeler | null
}

const defaultState: ModelerStore = {
  modeler: null,
  moddle: null,
  modeling: null,
  canvas: null,
  elementRegistry: null
}

export default defineStore('modeler', {
  state: () => defaultState,
  actions: {
    setModeler(modeler: Modeler) {
      this.modeler = modeler
    },
    setModules(key, module) {
      this[key] = module
    }
  }
})
