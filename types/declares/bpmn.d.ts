/************************************* 基础扩展功能定义 ******************************************/
declare module 'bpmn-js' {
  import BaseViewer from 'bpmn-js/lib/BaseViewer'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export default class Viewer<E extends Element> extends BaseViewer<E> {
    constructor(options?: ViewerOptions<E>)
  }
}
declare module 'bpmn-js/lib/BaseViewer' {
  import Diagram from 'diagram-js'
  import { ViewerOptions, ModdleElement } from 'diagram-js/lib/model'
  import { InternalEvent } from 'diagram-js/lib/core/EventBus'
  import { ModuleDefinition } from 'didi'

  export interface WriterOptions {
    format?: boolean
    preamble?: boolean
  }
  export interface DoneCallbackOpt {
    warn: any[]
    xml: string
    err?: any
  }
  export type BPMNEvent = string
  export type BPMNEventCallback<P extends InternalEvent> = (params: P) => void

  export default class BaseViewer<E extends Element> extends Diagram<E> {
    constructor(options?: ViewerOptions<E>)
    importXML(xml: string): Promise<DoneCallbackOpt>
    open(diagram: string): Promise<DoneCallbackOpt>
    saveXML(options: WriterOptions): Promise<DoneCallbackOpt>
    saveSVG(options: WriterOptions): Promise<DoneCallbackOpt>
    clear(): void
    destroy(): void
    on<T extends BPMNEvent, P extends InternalEvent>(
      event: T,
      priority: number | BPMNEventCallback<P>,
      callback?: BPMNEventCallback<P>,
      target?: this
    ): void
    off<T extends BPMNEvent, P extends InternalEvent>(events: T | T[], callback?: BPMNEventCallback<P>): void
    attachTo<T extends Element>(parentNode: string | T): void
    detach(): void
    importDefinitions(): ModdleElement
    getDefinitions(): ModdleElement
    protected _setDefinitions(definitions: ModdleElement): void
    protected _modules: ModuleDefinition[]
  }
}
declare module 'bpmn-js/lib/NavigatedViewer' {
  import Viewer from 'bpmn-js'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export default class NavigatedViewer<E extends Element> extends Viewer<E> {
    constructor(options?: ViewerOptions<E>)
  }
}
declare module 'bpmn-js/lib/BaseModeler' {
  import Viewer from 'bpmn-js'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export default class BaseModeler<E extends Element> extends Viewer<E> {
    constructor(options?: ViewerOptions<E>)
  }
}
declare module 'bpmn-js/lib/Modeler' {
  import BaseModeler from 'bpmn-js/lib/BaseModeler'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export default class Modeler<E extends Element> extends BaseModeler<E> {
    constructor(options?: ViewerOptions<E>)
    createDiagram(): void // 创建流程图
  }
}
