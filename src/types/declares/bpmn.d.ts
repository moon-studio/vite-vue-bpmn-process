import { Diagram, ViewerOptions, DoneCallbackOpt, EventCallbackParams, ModdleElement } from '@/types/declares/diagram'
import { InjectionContext, LocalsMap, ModuleDeclaration } from '@/types/declares/didi'

/************************************* 参数类型定义 ******************************************/

declare type BPMNEvent = string
declare type BPMNEventCallback<P extends EventCallbackParams> = (params: P) => void
declare interface WriterOptions {
  format?: boolean
  preamble?: boolean
}
declare interface DoneCallbackOpt {
  warn: any[]
  xml: string
  err?: any
}

/************************************* 初始构造函数 ******************************************/
declare default class BaseViewer<E extends Element> extends Diagram {
  constructor(options?: ViewerOptions<E>)
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

declare class Viewer<E extends Element> extends BaseViewer<E> {
  constructor(options?: ViewerOptions<E>)
}

declare class BaseModeler<E extends Element> extends Viewer<E> {
  constructor(options?: ViewerOptions<E>)
}

declare class NavigatedViewer<E extends Element> extends Viewer<E> {
  constructor(options?: ViewerOptions<E>)
}

declare class Modeler<E extends Element> extends BaseModeler<E> {
  invoke<T>(func: (...args: unknown[]) => T, context: InjectionContext, locals: LocalsMap): T
  createDiagram(): void // 创建流程图
}

/************************************* 基础扩展功能定义 ******************************************/
declare module 'bpmn-js' {
  declare class Viewer<E extends Element> extends BaseViewer<E> {
    constructor(options?: ViewerOptions<E>)
  }
}
declare module 'bpmn-js/lib/Modeler' {
  export = Modeler
}
declare module 'bpmn-js/lib/NavigatedViewer' {
  export = NavigatedViewer
}
