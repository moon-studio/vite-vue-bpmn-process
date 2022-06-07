// @ts-ignore

import { Base, Shape, Connection, Label } from 'diagram-js/lib/model'

declare global {
  interface Window {
    bpmnInstances: any
  }
  interface Object {
    [key: string | number]: string | number | boolean | undefined | null | Object | Function
  }

  type BpmnElement = Base | Shape | Connection | Label
}

declare interface Window {
  bpmnInstances: any
}
