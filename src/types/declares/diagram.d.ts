/************************************** Diagram.js 入口声明 *****************************************/
declare module 'diagram-js' {
  import { ViewerOptions } from 'diagram-js/lib/model'
  export interface DJSModule {
    __depends__?: DJSModule[]
    __init__?: any[]
    [id: string]: undefined | any[] | DJSModule[] | ['type' | 'factory' | 'value', any]
  }
  export default class Diagram<E extends Element> {
    constructor(options?: ViewerOptions<E>, injector?: any)
    get<T>(name: string, strict?: boolean): T
    invoke(fn: (...v: any[]) => void | any[]): void
    destroy(): void
    clear(): void
  }
}
/************************************** Diagram 核心模块 声明 *****************************************/
declare module 'diagram-js/lib/core/Canvas' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import { Base } from 'diagram-js/lib/model'

  export type Dimensions = {
    width: number
    height: number
  }
  export type Viewbox = {
    x: number
    y: number
    width: number
    height: number
    scale: number
    inner: Dimensions & {
      x: number
      y: number
    }
    outer: Dimensions
  }

  export default class Canvas {
    constructor(config: any, eventBus: EventBus, graphicsFactory: GraphicsFactory, elementRegistry: ElementRegistry)
    getDefaultLayer(): SVGElement
    getLayer(name: string, index: number): SVGElement
    showLayer(name: string): SVGElement
    hideLayer(name: string): SVGElement
    getActiveLayer(): SVGElement | null
    findRoot<E extends Base>(element: string | E): E
    getRootElements<E extends Base>(): E[]
    getContainer<E extends Element>(): E
    addMarker<E extends Base>(element: E | string, marker: string): void
    removeMarker<E extends Base>(element: E | string, marker: string): void
    hasMarker<E extends Base>(element: E | string, marker: string): boolean
    toggleMarker<E extends Base>(element: E | string, marker: string): void
    getRootElement<E extends Base>(): E | Object | null
    addRootElement<E extends Base>(element: E | Object): E | Object
    removeRootElement<E extends Base>(rootElement: E | string): E | Object
    setRootElement<E extends Base>(rootElement: E | Object, override?: boolean): E | Object
    addShape<E extends Base>(shape: E | Object, parent?: E, parentIndex?: number): E
    addConnection<E extends Base>(shape: E | Object, parent?: E, parentIndex?: number): E
    removeShape<E extends Base>(shape: E | string): E
    removeConnection<E extends Base>(shape: E | string): E
    getGraphics<E extends Base>(element: E | string, secondary?: boolean): SVGElement
    viewbox(box: Dimensions & { x: number; y: number }): Object
  }
}
declare module 'diagram-js/lib/core/ElementFactory' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  export default class ElementFactory {
    constructor(eventBus: EventBus, elementRegistry: ElementRegistry, modeling: any)
  }
}
declare module 'diagram-js/lib/core/ElementRegistry' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  export default class ElementRegistry {
    constructor(eventBus: EventBus)
  }
}
declare module 'diagram-js/lib/core/EventBus' {
  import { Base } from 'diagram-js/lib/model'

  export default class EventBus {
    on<T extends string, E extends Base>(
      event: T,
      priority: number | EventCallback<T, E>,
      callback?: EventCallback<T, E>,
      that?: any
    ): void
    once<T extends string, E extends Base>(event: T, priority: number, callback: EventCallback<T, E>): void
    off<T extends string, E extends Base>(events: string | string[], callback?: EventCallback<T, E>): void
    createEvent(data?: any): InternalEvent
    fire(name: string | { type: string }, event: any, ...data: any[]): any
    handleError(error: any): boolean
  }

  export interface InternalEvent {
    cancelBubble?: boolean
    defaultPrevented?: boolean
    init(data: any): void
    stopPropagation(): void
    preventDefault(): void
    [field: string]: any
  }

  export type EventCallback<T extends string, E extends Base> = (event: EventType<T, E>, data: any) => any
  export type EventType<T extends string, E extends Base> = EventMap<E> extends Record<T, infer P> ? P : InternalEvent
  interface EventMap<E extends Base> {
    [event: string]: SelectionEvent<E> | ElementEvent<E>
  }
  export interface SelectionEvent<E extends Base> extends InternalEvent {
    readonly type: string
    newSelection: E[]
    oldSelection: E[]
  }
  export interface ElementEvent<E extends Base> extends InternalEvent {
    readonly type: string
    element: E
    gfx: SVGElement
    originalEvent: MouseEvent
  }
}
declare module 'diagram-js/lib/core/GraphicsFactory' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  export default class GraphicsFactory {
    constructor(eventBus: EventBus, elementRegistry: ElementRegistry)
  }
}

/************************************** Diagram Model 元素 声明 *****************************************/
declare module 'diagram-js/lib/model' {
  import { DJSModule } from 'diagram-js'
  import { KeyboardConfig } from 'diagram-js/lib/features/keyboard/Keyboard'
  import { Descriptor, Moddle } from 'moddle'

  export interface Point {
    x: number
    y: number
    original?: Point
  }

  export abstract class ModdleBase {
    get(name: string): any
    set(name: string, value: any): void
  }

  export abstract class ModdleElement extends ModdleBase {
    static $model: Moddle
    static $descriptor: Descriptor
    readonly $type: string
    $attrs: any
    $parent: ModdleElement
    $instanceOf: ((type: string) => boolean) & ((element: Base, type: string) => boolean)
    di?: ModdleElement;
    [field: string]: any
    static hasType(element: ModdleElement, type?: string): boolean
  }

  export interface Base {
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

  export interface Connection extends Base {
    source: Base
    target: Base
    waypoints?: Point[]
  }

  export interface Shape extends Base {
    children: Base[]
    host: Shape
    attachers: Shape[]
    collapsed?: boolean
    hidden?: boolean
    x?: number
    y?: number
  }

  export interface Root extends Shape {}

  export interface Label extends Shape {
    labelTarget: Base
  }

  export interface ViewerOptions<E extends Element> {
    keyboard?: KeyboardConfig<E>
    container?: string | E
    width?: string | number
    height?: string | number
    position?: string
    deferUpdate?: boolean
    modules?: DJSModule[]
    additionalModules?: any[]
    moddleExtensions?: { [id: string]: any }
    propertiesPanel?: {
      parent: string | E
    }
    [field: string]: any
  }
}

declare module 'diagram-js/lib/features/keyboard/Keyboard' {
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class Keyboard<T extends Element> {
    constructor(config: KeyboardConfig<T>, eventBus: EventBus)
    bind(node: Node): void
    getBinding(): Node
    unbind(): void
    addListener(listener: (e: Event) => void, type?: string): void
    addListener(priority: number, listener: (e: Event) => void, type?: string): void
    removeListener(listener: (e: Event) => void, type?: string): void
    hasModifier(e: KeyboardEvent): boolean
    isCmd(e: KeyboardEvent): boolean
    isShift(e: KeyboardEvent): boolean
    isKey(e: KeyboardEvent): boolean
  }
  export interface KeyboardConfig<T extends Element> {
    bindTo: T
  }
}
