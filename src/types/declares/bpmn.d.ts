import { Diagram, ViewerOptions, DoneCallbackOpt, EventCallbackParams, ModdleElement } from '@/types/declares/diagram'
import { ModuleDeclaration } from '@/types/declares/didi.t'

/************************************* 参数类型定义 ******************************************/
export interface Point {
  x: number
  y: number
  original?: Point
}
export interface ModdleBase {
  get(name: string): any
  set(name: string, value: any): void
}
declare interface ModdleElement extends ModdleBase {
  readonly $type: string
  $model: Moddle
  $descriptor: Descriptor
  $attrs: any
  $parent: ModdleElement
  $instanceOf: ((type: string) => boolean) & ((element: Base, type: string) => boolean)
  di?: ModdleElement
  [field: string]: any
  hasType(element: ModdleElement, type?: string): boolean
}
declare interface Base {
  id: string
  type: string
  width?: number
  height?: number
  businessObject: ModdleElement
  label: Label
  parent: Shape
  labels: Label[]
  outgoingRefs: Connection[]
  incomingRefs: Connection[]
}
declare interface Connection extends Base {
  source: Base
  target: Base
  waypoints?: Point[]
}
declare interface Shape extends Base {
  children: Base[]
  host: Shape
  attachers: Shape[]
  collapsed?: boolean
  hidden?: boolean
  x?: number
  y?: number
}
declare interface Root extends Shape {}
declare interface Label extends Shape {
  labelTarget: Base
}

export type BPMNEvent = string
export type BPMNEventCallback<P extends EventCallbackParams> = (params: P) => void
export interface WriterOptions {
  format?: boolean
  preamble?: boolean
}
export interface DoneCallbackOpt {
  warn: any[]
  xml: string
  err?: any
}

/************************************* 初始构造函数 ******************************************/
export default class BaseViewer extends Diagram {
  constructor(options?: ViewerOptions)
  importXML(xml: string): Promise<DoneCallbackOpt>
  open(diagram: BPMNDiagram | string): Promise<DoneCallbackOpt>
  saveXML(options: WriterOptions): Promise<DoneCallbackOpt>
  saveSVG(options: WriterOptions): Promise<DoneCallbackOpt>
  clear(): void
  destroy(): void
  on<T extends BPMNEvent, P extends EventCallbackParams>(
    event: T,
    priority: number | BPMNEventCallback<P>,
    callback?: BPMNEventCallback<P>,
    target?: this
  ): void
  off<T extends BPMNEvent, P extends EventCallbackParams>(events: T | T[], callback?: BPMNEventCallback<P>): void
  attachTo<T extends Element>(parentNode: string | T): void
  detach(): void
  importDefinitions(): ModdleElement
  getDefinitions(): ModdleElement
  protected _setDefinitions(definitions: ModdleElement): void
  protected _modules: ModuleDeclaration[]
}

export class Viewer extends BaseViewer {
  constructor(options?: ViewerOptions)
}

declare class BaseModeler extends Viewer {
  constructor(options?: ViewerOptions)
}

declare class Modeler extends BaseModeler {
  invoke(fn: (...v: any[]) => void | any[]): void
  createDiagram(): void // 创建流程图
}

/************************************* 基础扩展功能定义 ******************************************/

declare module 'bpmn-js/lib/Modeler' {
  export default Modeler
}
