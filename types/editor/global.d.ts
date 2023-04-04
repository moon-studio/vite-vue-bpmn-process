import { Base, Shape, Connection, Label } from 'diagram-js/lib/model'
import { MessageApiInjection } from 'naive-ui/lib/message/src/MessageProvider'

declare global {
  interface Window {
    bpmnInstances: any
    __messageBox: MessageApiInjection
  }

  type BpmnElement = Base | Shape | Connection | Label
}

declare interface Window {
  bpmnInstances: any
}
