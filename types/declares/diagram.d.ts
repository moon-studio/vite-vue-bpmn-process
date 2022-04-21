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
// 提供可撤销/重做的命令执行栈, 通过 CommandHandler 执行具体命令
declare module 'diagram-js/lib/command/CommandStack' {
  import { Base } from 'diagram-js/lib/model'
  import { Injector } from 'didi'
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
// 抽象类，继承实现可以在 CommandStack 中注册的命令
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
// CommandHandler 实现类 的一个验证和扩展程序
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
// 抽象类 基础渲染器
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
// 继承 BaseRenderer 的默认渲染器
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
// 默认渲染样式
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
// 元素模型定义
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
// 基本建模器，提供基础操作方法，内部方法都继承 CommandHandler 来实现
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
// 一种接口，通过将请求触发操作的人和触发器本身解耦，提供对建模操作的访问。
// 可以通过将新操作注册到 'registerAction' 来添加新操作，并同样使用 'unregisterAction' 取消注册现有操作。
declare module 'diagram-js/lib/features/editor-actions/EditorActions' {
  import { Injector } from 'didi'
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
// 键盘事件绑定和映射
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
// 添加默认键盘绑定
declare module 'diagram-js/lib/features/keyboard/KeyboardBindings' {
  import Keyboard from 'diagram-js/lib/features/keyboard/Keyboard'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import EditorActions from 'diagram-js/lib/features/editor-actions/EditorActions'

  export default class KeyboardBindings<T extends Element> {
    constructor(eventBus: EventBus, keyboard: Keyboard<T>)
    registerBindings<T extends Element>(keyboard: Keyboard<T>, editorActions: EditorActions): void
  }
}
// 将覆盖元素或者dom 附加到对应图元素的服务
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
// 左侧基础元素工具栏
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
    getEntries(element: Base): { [name: string]: PaletteEntry }
    trigger(action: string, event: Event, autoActivate?: boolean): void
    open(): void
    close(): void
    toggle(): void
    isOpen(): boolean
    isActiveTool(tool: string): boolean
    updateToolHighlight(name: string): void
  }
}
// 在图表元素旁边显示特定于元素的上下文操作的操作菜单
declare module 'diagram-js/lib/features/context-pad/ContextPad' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Overlays from 'diagram-js/lib/features/overlays/Overlays'
  import { Base } from 'diagram-js/lib/model'
  import { Overlay } from 'diagram-js/lib/features/overlays/Overlays'

  export type ContextPadEntry = {}
  export type ContextPadProvider = {
    getContextPadEntries(element: Base): ContextPadEntry
  }

  export default class ContextPad {
    constructor(config: any, eventBus: EventBus, overlays: Overlays)
    protected _init(): void
    registerProvider(priority: number | ContextPadProvider, provider?: ContextPadProvider): void
    getEntries(element: Base): { [name: string]: ContextPadEntry }
    trigger(action: string, event: Event, autoActivate?: boolean): void
    open(element: Base, force?: boolean): void
    close(): void
    getPad(element: Base): Overlay | null
  }
}
// 一个弹出菜单，可用于在画布中的任何位置显示操作列表
declare module 'diagram-js/lib/features/popup-menu/PopupMenu' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Overlays from 'diagram-js/lib/features/overlays/Overlays'
  import PopupMenuProvider from 'diagram-js/lib/features/popup-menu/PopupMenuProvider'
  import { Base } from 'diagram-js/lib/model'
  import { Position } from 'diagram-js/lib/core/Canvas'

  export default class PopupMenu {
    constructor(config: any, eventBus: EventBus, overlays: Overlays)
    registerProvider(id: string, priority: number | PopupMenuProvider, provider?: PopupMenuProvider): void
    isEmpty(element: Base, providerId: string): boolean
    open(element: Base, id: string, position: Position): Object
    close(): void
    isOpen(): boolean
    trigger(event: Object): Function | null
  }
}
// 抽象类，可以扩展为弹出菜单提供条目的基本提供程序。
// 扩展应该实现方法getEntries和register。可选地，可以实现方法getHeaderEntries
declare module 'diagram-js/lib/features/popup-menu/PopupMenuProvider' {
  import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
  import { Base } from 'diagram-js/lib/model'

  export default abstract class PopupMenuProvider {
    constructor(popupMenu: PopupMenu)
    abstract getEntries(element: Base): void
    abstract getHeaderEntries(element: Base): void
    abstract register(): void
  }
}
// 在图表中提供当前选择元素的服务。也提供了控制选择的api
declare module 'diagram-js/lib/features/selection/Selection' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Base } from 'diagram-js/lib/model'

  interface SelectedElement extends Base {}

  export default class Selection {
    constructor(eventBus: EventBus, canvas: Canvas)
    protected _selectedElements: Array<SelectedElement>
    select(elements: Array<SelectedElement>, add?: boolean): void
    deselect(element: SelectedElement): void
    get(): Array<SelectedElement>
    isSelected(element: SelectedElement): boolean
  }
}
// 选择事件的不同时期的事件触发程序
declare module 'diagram-js/lib/features/selection/SelectionBehavior' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import { Base } from 'diagram-js/lib/model'

  export default class SelectionBehavior {
    constructor(eventBus: EventBus, selection: Selection, canvas: Canvas, elementRegistry: ElementRegistry)
  }
}
// 为选择元素添加/移除选择样式及标记dom
declare module 'diagram-js/lib/features/selection/SelectionVisuals' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Styles from 'diagram-js/lib/draw/Styles'

  export default class SelectionVisuals {
    constructor(eventBus: EventBus, canvas: Canvas, selection: Selection, styles: Styles)
    protected _multiSelectionBox: any
  }
}
// 允许替换元素类型的服务
declare module 'diagram-js/lib/features/replace/Replace' {
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import { Base, Shape } from 'diagram-js/lib/model'

  export default class Replace {
    constructor(modeling: Modeling)
    replaceElement<E extends Base, S extends Shape>(oldElement: E, newElement: Object | E, options?: Object): S
  }
}
// 为某些图操作提供规则的服务。
// 默认实现将挂入命令堆栈执行实际的规则评估。确保提供命令堆栈如果您打算使用此模块，请使用它。
// 连同此实现，您可以使用 RulesProvider 来实现你自己的规则检查器。
declare module 'diagram-js/lib/features/rules/Rules' {
  import { Injector } from 'didi'
  import CommandStack from 'diagram-js/lib/command/CommandStack'

  export default class Rules {
    constructor(injector: Injector)
    protected _commandStack: CommandStack
    allowed(action: string, context?: Object): boolean
  }
}
// 可以扩展以实现建模规则的基本提供程序。
// 扩展应该实现init方法来实际添加他们的自定义建模检查。可以通过 addRule(action，fn) 方法添加检查。
declare module 'diagram-js/lib/features/rules/RulesProvider' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor'

  export default class RulesProvider extends CommandInterceptor {
    constructor(eventBus: EventBus)
    protected init(): void
    addRule(actions: string | string[], priority: number | Function, fn?: Function): void
  }
}
// 提供画布上形状大小调整的组件
declare module 'diagram-js/lib/features/resize/Resize' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import { Shape } from 'diagram-js/lib/model'
  import { Bounds } from 'diagram-js/lib/core/Canvas'

  export default class Resize {
    constructor(eventBus: EventBus, rules: Rules, modeling: Modeling, dragging: Dragging)
    canResize(context: Object): boolean
    activate<E extends Shape>(event: MouseEvent, shape: E, contextOrDirection: Object | string): void
    computeMinResizeBox(context: Object): Bounds
  }
}
// 该组件负责添加调整大小句柄
declare module 'diagram-js/lib/features/resize/ResizeHandles' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import Resize from 'diagram-js/lib/features/resize/Resize'
  import { Shape } from 'diagram-js/lib/model'

  export default class ResizeHandles {
    constructor(eventBus: EventBus, canvas: Canvas, selection: Selection, resize: Resize)
    protected _resize: Resize
    protected _canvas: Canvas
    protected _getResizersParent(): SVGElement
    makeDraggable<E extends Shape>(element: E, gfx: SVGElement, direction: string): void
    createResizer<E extends Shape>(element: E, direction: string): void
    addResizer(shape: Shape): void
    removeResizers(): void
  }
}
// 提供调整大小时调整形状的预览
declare module 'diagram-js/lib/features/resize/ResizePreview' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import PreviewSupport from 'diagram-js/lib/features/preview-support/PreviewSupport'
  export default class ResizePreview {
    constructor(eventBus: EventBus, canvas: Canvas, previewSupport: PreviewSupport)
  }
}
// 触发 canvas 话不内 拖动事件并实现一般 “拖放” 事件的操作。会在不同生命周期中通过 eventBus 触发不同的事件。
declare module 'diagram-js/lib/features/dragging/Dragging' {
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'

  export default class Dragging {
    constructor(eventBus: EventBus, canvas: Canvas, selection: Selection, elementRegistry: ElementRegistry)
    protected init(): void
    private move(event: Event, activate?: Object): void
    private hover(event: Event): void
    private out(event: Event): void
    private end(event: Event): void
    private cancel(restore?: boolean): void
    private context(): Object | null
    private setOptions(options: Object): void
  }
}
// 增加对移动 / 调整大小元素预览的支持
declare module 'diagram-js/lib/features/preview-support/PreviewSupport' {
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Styles from 'diagram-js/lib/draw/Styles'
  import { Base } from 'diagram-js/lib/model'

  export default class PreviewSupport {
    constructor(elementRegistry: ElementRegistry, eventBus: EventBus, canvas: Canvas, styles: Styles)
    protected _clonedMarkers: Object
    getGfx<E extends Base>(element: E): SVGElement
    addDragger<E extends Base>(element: E, group: SVGElement, gfx?: SVGElement): SVGElement
    addFrame<E extends Base>(element: E, group: SVGElement): SVGElement
  }
}
//
// declare module 'diagram-js/lib/features/xxx/xxx' {
//   export default class xxx {}
// }
