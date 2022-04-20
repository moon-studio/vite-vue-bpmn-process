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
// canvas 图层渲染显示
declare module 'diagram-js/lib/core/Canvas' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import { Base, Point } from 'diagram-js/lib/model'

  export type Dimensions = {
    width: number
    height: number
  }
  export type Position = {
    x: number
    y: number
  }
  export type Delta = {
    dx: number
    dy: number
  }
  export type Bounds = Position & Dimensions
  export type Viewbox = {
    x: number
    y: number
    width: number
    height: number
    scale: number
    inner: Dimensions & Position
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
    viewbox(box: Dimensions & { x: number; y: number }): Viewbox
    scroll(delta: Delta): Position
    scrollToElement<E extends Base>(elements?: Array<E | Object>, padding?: number | Object): Position
    zoom(newScale: number | string, center: Point | string): number
    getSize(): Dimensions
    getAbsoluteBBox<E extends Base>(element: E): Bounds
    resized(): void
  }
}
// 元素模型工厂
declare module 'diagram-js/lib/core/ElementFactory' {
  import { Root, Label, Shape, Connection } from 'diagram-js/lib/model'

  export default class ElementFactory {
    constructor()
    create(type: string, attrs: any): Root | Shape | Connection | Label
    createRoot<E extends Root>(attrs: any): E
    createLabel<E extends Label>(attrs: any): E
    createShape<E extends Shape>(attrs: any): E
    createConnection<E extends Connection>(attrs: any): E
  }
}
// 元素注册表
declare module 'diagram-js/lib/core/ElementRegistry' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Base } from 'diagram-js/lib/model'
  export default class ElementRegistry {
    constructor(eventBus: EventBus)
    add<E extends Base>(element: E, gfx: SVGElement, secondaryGfx?: SVGElement): void
    remove<E extends Base>(element: E): void
    updateId<E extends Base>(element: E, newId: string): void
    updateGraphics<E extends Base>(element: E, gfx: SVGElement, secondary?: boolean): void
    get<E extends Base>(filter: string | SVGElement): E
    filter<E extends Base>(fn: (element: E) => boolean): E[]
    find<E extends Base>(fn: (element: E) => boolean): E[]
    getAll<E extends Base>(): E[]
    forEach<E extends Base>(fn: (element: E) => void): void
    getGraphics<E extends Base>(filter: E | string, secondary?: boolean): SVGElement
  }
}
// 事件总线
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
// SVG 元素工厂
declare module 'diagram-js/lib/core/GraphicsFactory' {
  import { Base, Shape, Connection } from 'diagram-js/lib/model'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'

  export default class GraphicsFactory {
    constructor(eventBus: EventBus, elementRegistry: ElementRegistry)
    create<E extends Base>(type: string, element: E, parentIndex?: number): SVGElement
    drawShape<E extends Shape>(gfx: SVGElement | string, element: E): void
    drawConnection<E extends Connection>(gfx: SVGElement | string, element: E): void
    getShapePath<E extends Shape>(element: E): string
    getConnectionPath<E extends Connection>(element: E): string
    update<E extends Base>(type: string, element: E, gfx: SVGElement): void
    remove<E extends Base>(element: E): void
  }
}
/************************************** Diagram command 命令执行栈 *****************************************/
declare module 'diagram-js/lib/command/CommandStack' {
  import { Base } from 'diagram-js/lib/model'
  import { Injector } from '@/types/declares/didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import CommandHandler from 'diagram-js/lib/command/CommandHandler'

  export type CommandContext = {
    context: Base
    oldValues: { [key: string]: any }
    newValues: { [key: string]: any }
  }
  export type Command = string

  export default class CommandStack {
    constructor(eventBus: EventBus, injector: Injector)
    execute(command: Command, context: Object): void
    canExecute(command: Command, context: Object): boolean
    clear(emit?: boolean): void
    undo(): void
    redo(): void
    register(command: Command, handler: CommandHandler): void
    registerHandler(command: Command, handler: CommandHandler | Function): void
    canUndo(): boolean
    canRedo(): boolean
  }
}
declare module 'diagram-js/lib/command/CommandHandler' {
  import { Base } from 'diagram-js/lib/model'

  export default abstract class CommandHandler {
    abstract execute<E extends Base>(context: Object): E[]
    abstract revert<E extends Base>(context: Object): E[]
    abstract canExecute(context: Object): boolean
    abstract preExecute(context: Object): void
    abstract postExecute(context: Object): void
  }
}
declare module 'diagram-js/lib/command/CommandInterceptor' {
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class CommandInterceptor {
    constructor(eventBus: EventBus)
    on(events?: string | string[], hook?: string, priority?: number, handler?: Function, unwrap?: boolean): void
    canExecute(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): boolean
    preExecute(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    preExecuted(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    execute(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    executed(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    postExecute(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    postExecuted(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    revert(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    reverted(
      events?: string | string[],
      hook?: string,
      priority?: number,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
  }
}
/************************************** Diagram Draw 元素绘制模块 *****************************************/
declare module 'diagram-js/lib/draw/BaseRenderer' {
  import { Connection, Shape } from 'diagram-js/lib/model'
  export default abstract class BaseRenderer {
    abstract canRender(): boolean
    abstract drawShape<E extends Shape>(visuals: SVGElement, element: E): SVGRectElement
    abstract drawConnection<E extends Connection>(visuals: SVGElement, connection: E): SVGPolylineElement
    abstract getShapePath<E extends Shape>(shape: E): string
    abstract getConnectionPath<E extends Connection>(connection: E): string
  }
}
declare module 'diagram-js/lib/draw/DefaultRenderer' {
  import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Styles, { Traits } from 'diagram-js/lib/draw/Styles'
  import { Connection, Shape } from 'diagram-js/lib/model'

  export default class DefaultRenderer extends BaseRenderer {
    constructor(eventBus: EventBus, styles: Styles, DEFAULT_RENDER_PRIORITY?: number)
    CONNECTION_STYLE: Traits
    SHAPE_STYLE: Traits
    FRAME_STYLE: Traits
    canRender(): boolean
    drawShape<E extends Shape>(visuals: SVGElement, element: E, attrs?: Object): SVGRectElement
    drawConnection<E extends Connection>(visuals: SVGElement, connection: E, attrs?: Object): SVGPolylineElement
    getShapePath<E extends Shape>(shape: E): string
    getConnectionPath<E extends Connection>(connection: E): string
  }
}
declare module 'diagram-js/lib/draw/Styles' {
  export type Traits = {
    'no-fill': Traits
    'no-border': Traits
    'no-events': Traits
    [styleName: string]: string | number | Traits
  }
  export default class Styles {
    constructor()
    cls(className: string, traits?: string[], additionalAttrs?: Object): Traits & { class: string }
    style(traits?: string[], additionalAttrs?: Object): Traits
    computeStyle(custom?: Object | null, traits?: string[], defaultStyles?: Object): Traits
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
/************************************** Diagram feature 扩展功能模块 *****************************************/
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
