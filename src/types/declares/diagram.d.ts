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
/************************************** Diagram translate 翻译模块 *****************************************/
declare module 'diagram-js/lib/i18n/translate' {
  export function translate(template: string, replacements?: Object): string
}
/************************************** Diagram feature 扩展功能模块 *****************************************/
declare module 'diagram-js/lib/features/modeling/Modeling' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import CommandStack from 'diagram-js/lib/command/CommandStack'
  import CommandHandler from 'diagram-js/lib/command/CommandHandler'
  import { Base, Connection, Label, Shape } from 'diagram-js/lib/model'
  import { Dimensions, Position } from 'diagram-js/lib/core/Canvas'

  export class ModelingHandler extends CommandHandler {
    constructor(modeling: Modeling)
    canExecute(context: Object): boolean
    execute<E extends Base>(context: Object): E[]
    postExecute(context: Object): void
    preExecute(context: Object): void
    revert<E extends Base>(context: Object): E[]
  }

  export default class Modeling {
    constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: CommandStack)
    getHandlers<H extends ModelingHandler>(): H[]
    registerHandlers(commandStack: CommandStack[]): void
    moveShape(shape: Base, delta: Position, newParent: Base, newParentIndex?: number, hints?: Object): void
    updateAttachment(shape: Base, newHost?: Base): void
    moveElements(shapes: Base[], delta: Position, target?: Base, hints?: Object): void
    moveConnection(connection: Base, delta: Position, newParent: Base, newParentIndex?: number, hints?: Object): void
    layoutConnection(connection: Base, hints?: Object): void
    createConnection(
      source: Base,
      target: Base,
      parentIndex: number | Connection | Object,
      connection: Connection | Object,
      parent: Base | Object,
      hints?: Object
    ): Connection
    createShape(shape: Shape | Object, position: Position, target: Base, parentIndex?: number, hints?: Object): Shape
    createElements(elements: Base[], position: Position, target: Base, parentIndex?: number, hints?: Object): Base[]
    createLabel(labelTarget: Base, position: Position, label: Base, parent?: Base): Label
    appendShape(source: Base, shape: Base | Object, position: Position, target: Base, hints?: Object): Shape
    removeElements(elements: Base[]): void
    distributeElements(groups: Base[], axis: string, dimension: Dimensions): void
    removeShape(shape: Shape, hints?: Object): void
    removeConnection(connection: Connection, hints?: Object): void
    replaceShape(oldShape: Shape, newShape: Shape, hints?: Object): Shape
    alignElements(elements: Base[], alignment: string): void
    resizeShape(shape: Shape, newBounds: Dimensions, minBounds?: Dimensions, hints?: Object): void
    createSpace(movingShapes: Base[], resizingShapes: Base[], delta: Position, direction: string, hints?: Object): void
    updateWaypoints(connection: Connection, newWaypoints: Position[], hints?: Object): void
    reconnect(
      connection: Connection,
      source: Shape,
      target: Shape,
      dockingOrPoints: Position | Position[],
      hints?: Object
    ): void
    reconnectStart(
      connection: Connection,
      newSource: Shape,
      dockingOrPoints: Position | Position[],
      hints?: Object
    ): void
    reconnectEnd(connection: Connection, newTarget: Shape, dockingOrPoints: Position | Position[], hints?: Object): void
    connect(source: Shape, target: Shape, attrs?: Object, hints?: Object): Connection
    toggleCollapse(shape: Shape, hints?: Object): void
  }
}
declare module 'diagram-js/lib/features/editor-actions/EditorActions' {
  import { Injector } from '@/types/declares/didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  export default class EditorActions {
    constructor(eventBus: EventBus, injector: Injector)
    protected _actions: { [actionName: string]: Function }
    trigger(action: string, opts?: Object): unknown
    unregister(action: string): unknown
    getActions(): number
    isRegistered(action: string): boolean
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
declare module 'diagram-js/lib/features/keyboard/KeyboardBindings' {
  import Keyboard from 'diagram-js/lib/features/keyboard/Keyboard'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import EditorActions from 'diagram-js/lib/features/editor-actions/EditorActions'

  export default class KeyboardBindings<T extends Element> {
    constructor(eventBus: EventBus, keyboard: Keyboard<T>)
    registerBindings<T extends Element>(keyboard: Keyboard<T>, editorActions: EditorActions): void
  }
}
declare module 'diagram-js/lib/features/overlays/Overlays' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import { Base } from 'diagram-js/lib/model'

  export type Search = {
    id?: string
    element?: Base
    type?: string
  }
  export type Overlay = {
    html: string | HTMLElement
    show?: {
      minZoom?: number
      maxZoom?: number
    }
    position?: {
      left?: number
      top?: number
      bottom?: number
      right?: number
    }
    scale?: boolean & {
      min?: number
      max?: number
    }
  }
  export default class Overlays {
    constructor(config: any, eventBus: EventBus, canvas: Canvas, elementRegistry: ElementRegistry)
    get(search: Search): Overlay | Overlay[] | null
    add(element: Base, type: string, overlay: Overlay): string
    remove(filter: string | Object): void
    show(): void
    hide(): void
    clear(): void
  }
}
declare module 'diagram-js/lib/features/palette/Palette' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { Base } from 'diagram-js/lib/model'

  export type PaletteEntry = {
    group: string
    className?: string
    title: string
    action: string
    options?: any
  }
  export type PaletteProvider = {
    getPaletteEntries(element: Base): PaletteEntry[]
  }
  export type PaletteEntryDescriptor = {
    [key: string]: PaletteEntry
  }

  export default class Palette {
    constructor(eventBus: EventBus, canvas: Canvas)
    registerProvider(priority: number | PaletteProvider, provider?: PaletteProvider): void
    getEntries(element: Base): PaletteEntry[]
  }
}

// declare module 'diagram-js/lib/features/xxx/xxx' {
//   export default class xxx {}
// }
