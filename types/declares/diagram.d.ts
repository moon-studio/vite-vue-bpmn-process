/************************************** Diagram.js 入口声明 *****************************************/
declare module 'diagram-js' {
  import { Injector, ModuleDeclaration } from 'didi'
  import { ViewerOptions } from 'diagram-js/lib/model'

  /**
   * 初始化 Diagram 实例
   * @param {ViewerOptions} options 初始化参数
   * @param {ModuleDeclaration} [options.models] - 模型定义
   * @param {Injector} [injector] - 依赖注入实例
   * @example
   * 注册一个新模块
   * // 一个新模块，依赖 eventBus 事件总线实例
   * function MyLoggingPlugin(eventBus) {
   *   eventBus.on('shape.added', function(event) {
   *     console.log('shape ', event.shape, ' was added to the diagram');
   *   });
   * }
   * // 导出为一个 功能模块
   * export default {
   *   __init__: [ 'myLoggingPlugin' ],
   *     myLoggingPlugin: [ 'type', MyLoggingPlugin ]
   * };
   *
   * // 初始化 Diagram 实例
   * import MyLoggingModule from 'path-to-my-logging-plugin';
   *
   * const diagram = new Diagram({
   *   modules: [
   *     MyLoggingModule
   *   ]
   * });
   *
   * ### 初始化时默认会加载 Canvas, ElementRegistry, ElementFactory, EventBus,
   * GraphicsFactory 模块，并依赖于 DefaultRenderer 和 Styles 模块进行显示
   * new 时会触发 `canvas.init` 事件, 并进行后续实例初始化
   *
   * @returns {Diagram}
   */
  export default class Diagram {
    constructor(options: ViewerOptions<Element>, injector?: Injector)
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
  import { Root, Base, Point } from 'diagram-js/lib/model'

  export type Dimensions = {
    width: number
    height: number
  }
  export type Position = {
    x: number
    y: number
    parallel?: number
    seq?: number
    compensation?: number
    loop?: number
    adhoc?: number
  }
  export type Delta = {
    dx: number
    dy: number
  }
  export type Bounds = Position & Dimensions
  export type Layer = {
    index: number
    group: SVGElement
    visible: boolean
  }
  export type Viewbox = {
    x: number
    y: number
    width: number
    height: number
    scale: number
    inner: Dimensions & Position
    outer: Dimensions
  }

  /**
   * @class
   * @constructor
   * 画布构造函数
   * 初始化时抛出 canvas.init 事件
   */
  export default class Canvas {
    constructor(
      config: any,
      eventBus: EventBus,
      graphicsFactory: GraphicsFactory,
      elementRegistry: ElementRegistry
    )
    protected _eventBus: EventBus
    protected _elementRegistry: ElementRegistry
    protected _graphicsFactory: GraphicsFactory
    // 内部属性，保存图层实例
    protected _layers: Record<string, Layer>
    protected _planes: { rootElement: Root; layer: Layer }[]
    protected _rootElement: Root | undefined
    protected _cachedViewbox: Viewbox | undefined
    _svg: HTMLElement

    /**
     * ## 画布初始化方法，创建一个一直被 div#container 元素包裹的 svg 元素，可以通过访问外层 div 元素获取画布大小
     * <div class="djs-container" style="width: {desired-width}, height: {desired-height}">
     *   <svg width="100%" height="100%">
     *    ...
     *   </svg>
     * </div>
     * 同时以下事件监听
     * 注册 diagram.init 事件监听回调函数，在 diagram 实例化时抛出 canvas.init 事件
     * 注册 'shape.added', 'connection.added', 'shape.removed', 'connection.removed', 'elements.changed',
     *     'root.set' 事件监听回调函数，强制重新刷新视图
     * 注册 diagram.destroy, 同时执行 _destroy 销毁画布
     * 注册 diagram.clear, 同时执行 _clear 方法
     */
    protected _init(config: Object): void
    /**
     * 画布销毁
     * 抛出 canvas.destroy 事件，并从外层元素中移除 div#container
     */
    protected _destroy(): void
    /**
     * 画布清空
     * 调用 elementRegistry.getAll() 获取所有元素执行 canvas._removeElement 或者 canvas.removeRootElement
     */
    protected _clear(): void
    /**
     * ### 返回绘制所有元素的默认图层
     * 通常为最外层 SVG 元素 下 g.viewport 下的 g.layer-base 元素，而非最外层 SVG
     * @returns {SVGElement} dom 元素
     */
    getDefaultLayer(): SVGElement
    /**
     * 返回用于在其上绘制元素或注释的图层
     * @returns {SVGElement} dom 元素
     */
    getLayer(name: string, index: number): SVGElement

    /**
     * 对于给定的索引，返回具有较高索引且可见的层数。
     * @param index
     * @protected
     */
    protected _getChildIndex(index: number): number

    /**
     * 创建一个给定的层并返回
     * @param name 图层名称
     * @param index 图层层级索引
     * @returns {Layer} layer 对象
     */
    protected _createLayer(name: string, index: number): Layer

    /**
     * 根据传入名称显示图层，该图层必须存在于 canvas._layers 中
     * @param name {string} 图层名称
     * @returns {SVGElement} dom 元素
     */
    showLayer(name: string): SVGElement
    /**
     * 根据传入名称隐藏图层，该图层必须存在于 canvas._layers 中
     * @param name {string} 图层名称
     * @returns {SVGElement} dom 元素
     */
    hideLayer(name: string): SVGElement

    /**
     * 返回当前主要活动的图层，没有则返回 null
     * @returns {SVGElement|null} dom 元素
     */
    getActiveLayer(): SVGElement | null

    /**
     * 查找对应元素的跟元素实例
     * @param element {string | Base} 元素实例或元素名称
     * @returns {Base} 根元素实例
     */
    findRoot<E extends Base>(element: string | E): E

    /**
     * 查找所有根元素实例
     * @returns {Base[]} 根元素实例数组
     */
    getRootElements<E extends Base>(): E[]

    /**
     * 返回画布父元素
     * @returns {Element} dom div 元素
     */
    getContainer<E extends Element>(): E

    /**
     * 更新元素标记，通常是 class 类名, 触发 element.marker.update 事件
     * @param element { Base } 元素实例
     * @param marker { string } 标记名称
     * @param add { boolean } 是否添加标记
     * @protected
     */
    protected _updateMarker(element: Base, marker: string, add: boolean): void

    /**
     * 将标记添加到元素 (基本上是css类), 调用 _updateMarker(element, marker, true)
     * @param element { Base | string } 元素实例
     * @param marker { string } 标记名称
     */
    addMarker<E extends Base>(element: E | string, marker: string): void

    /**
     * 从元素中删除标记。调用 _updateMarker(element, marker, false)
     * @param element { Base | string } 元素实例
     * @param marker { string } 标记名称
     */
    removeMarker<E extends Base>(element: E | string, marker: string): void

    /**
     * 检查元素上是否存在标记。
     * @param element { Base | string } 元素实例
     * @param marker { string } 标记名称
     * @returns {boolean} 是否存在标记
     */
    hasMarker<E extends Base>(element: E | string, marker: string): boolean

    /**
     * 切换元素上的标记显示状态，根据 hasMarker 结果判断调用 addMarker 或者 removeMarker
     * @param element
     * @param marker
     */
    toggleMarker<E extends Base>(element: E | string, marker: string): void

    /**
     * 返回当前根元素。支持处理根元素的两种不同模式:
     *
     * 1. 如果之前没有添加根元素，则将添加一个隐式根并返回。这在不需要显式根元素的应用程序中使用。
     *
     * 2. 在调用之前添加了根元素时地托元素,根元素可以为null。这用于希望自己管理根元素的应用程序。
     *
     * @returns {Object|Root|null} rootElement.
     */
    getRootElement<E extends Base>(): E | Object | null

    /**
     * 添加给定的根元素并返回
     * @param element { Base | Object } 根元素
     * @returns {Base | Object} 根元素
     */
    addRootElement<E extends Base>(element: E | Object): E | Object

    /**
     * 删除给定的rootElement并返回
     * @param rootElement { Base | Object } 根元素
     * @returns {Base | Object} 根元素
     */
    removeRootElement<E extends Base>(rootElement: E | string): E | Object

    /**
     * 删除指定根元素，依次触发 root.remove, root.removed 事件
     * @param element {Base}
     */
    protected _removeRoot(element: Base): void

    /**
     * 将给定元素设置为画布的新根元素，并返回新的根元素。
     * @param rootElement {Base | Object}
     * @param [override] {boolean}
     * @returns {Base | Object}
     */
    setRootElement<E extends Base>(rootElement: E | Object, override?: boolean): E | Object

    /**
     * 将元素添加到画布中。根据所传入的 type 类型会触发对应的 [type].add, [type].added 事件
     * @param type {string} 元素类型
     * @param element {Base} 元素实例
     * @param [parent] {Base} 父元素实例
     * @param [parentIndex] {number} 父元素实例的索引
     * @returns {Base} 新添加的元素实例
     */
    protected _addElement(type: string, element: Base, parent?: Base, parentIndex?: number): void

    /**
     * 添加形状元素, 调用 _addElement('shape', element, parent, parentIndex)
     * @param shape
     * @param [parent] {Base} 父元素实例
     * @param [parentIndex] {number} 父元素实例的索引
     * @returns {Base} 新添加的元素实例
     */
    addShape<E extends Base>(shape: E | Object, parent?: E, parentIndex?: number): E

    /**
     * 添加连线元素, 调用 _addElement('connection', element, parent, parentIndex)
     * @param shape
     * @param [parent] {Base} 父元素实例
     * @param [parentIndex] {number} 父元素实例的索引
     * @returns {Base} 新添加的元素实例
     */
    addConnection<E extends Base>(shape: E | Object, parent?: E, parentIndex?: number): E

    /**
     * 从画布中移除对应的元素。根据所传入的 type 类型会触发对应的 [type].remove, [type].removed 事件
     * @param element {Base} 元素实例
     * @param type {string} 元素类型
     * @returns {Base} 被移除的元素实例
     */
    protected _removeElement(element: Base, type: string): void

    /**
     * 从画布中删除形状元素, 调用 _removeElement(element, 'shape')
     * @param shape {Base}
     * @returns {Base} 被移除的元素实例
     */
    removeShape<E extends Base>(shape: E | string): E

    /**
     * 从画布中删除形状连线, 调用 _removeElement(element, 'connection')
     * @param connection {Base}
     * @returns {Base} 被移除的元素实例
     */
    removeConnection<E extends Base>(connection: E | string): E

    /**
     * 返回在某个图元素下面的SVG图形对象
     * @param element {Base | string}
     * @param [secondary] {boolean} 是否返回二级连接元素
     * @return {SVGElement}
     */
    getGraphics<E extends Base>(element: E | string, secondary?: boolean): SVGElement

    /**
     * 通过给定的更改函数执行viewbox更新, 触发 canvas.viewbox.changing 事件
     * @param changeFn {Function}
     * @protected
     */
    protected _changeViewbox(changeFn: () => void): void

    /**
     * 触发 canvas.viewbox.changed 事件
     * @protected
     */
    protected _viewboxChanged(): void

    /**
     * 获取或重新设置画布的视图框，即当前显示的区域。
     * @param box { Dimensions & Position }
     * @returns {Viewbox}
     */
    viewbox(box: Dimensions & Position): Viewbox

    /**
     * 获取画布偏移（滚动）量，或者重新设置画布偏移（滚动）量。
     * @param [delta] {Delta}
     * @returns {Position}
     */
    scroll(delta: Delta): Position

    /**
     * 滚动viewbox以包含给定的元素。(可选) 指定要应用于边缘的填充
     * @param [elements] {Base[] | string[]}
     * @param [padding] {number | Object}
     */
    scrollToElement<E extends Base>(
      elements?: Array<E | Object>,
      padding?: number | Object
    ): Position

    /**
     * 获取或设置画布的当前缩放，可选地缩放到指定位置, 可使用 canvas.zoom('fit-viewport', 'auto') 使画布自动缩放至
     * 画布可见范围内并居中
     * @param {number | string} [newScale]
     * @param {Point | string} [center]
     * @return {number} zoom 当前缩放层级
     */
    zoom(newScale?: number | string, center?: Point | string): number

    /**
     * 返回画布的尺寸
     */
    getSize(): Dimensions
    /**
     * 返回给定元素的绝对边界坐标与元素高宽
     * @param {Base} element 元素
     * @return {Bounds} 坐标与高宽
     */
    getAbsoluteBBox<E extends Base>(element: E): Bounds
    /**
     * 强制刷新视图，并触发 canvas.resized 让其他元素同时调整
     */
    resized(): void
  }
}
// 元素模型工厂
declare module 'diagram-js/lib/core/ElementFactory' {
  import { Root, Label, Shape, Connection } from 'diagram-js/lib/model'

  export default class ElementFactory {
    constructor()
    protected _uid: number
    /**
     * 创建具有给定类型和许多预设属性的模型元素
     *
     * @param  {string} type
     * @param  {Object} attrs
     * @return {Base} the newly created model instance
     */
    create(type: string, attrs: any): Root | Shape | Connection | Label

    /**
     * 创建一个根元素, 调用 create('root', attrs)
     * @param {Object} attrs
     * @return {Base} the newly created model instance
     */
    createRoot<E extends Root>(attrs: any): E

    /**
     * 创建一个label标签元素, 调用 create('label', attrs)
     * @param {Object} attrs
     * @return {Base} the newly created model instance
     */
    createLabel<E extends Label>(attrs: any): E

    /**
     * 创建一个形状元素, 调用 create('shape', attrs)
     * @param {Object} attrs
     * @return {Base} the newly created model instance
     */
    createShape<E extends Shape>(attrs: any): E

    /**
     * 创建一个连线元素, 调用 create('connection', attrs)
     * @param {Object} attrs
     * @return {Base} the newly created model instance
     */
    createConnection<E extends Connection>(attrs: any): E
  }
}
// 元素注册表
declare module 'diagram-js/lib/core/ElementRegistry' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Base } from 'diagram-js/lib/model'
  export default class ElementRegistry {
    private _elements: Record<string, Base>
    constructor(eventBus: EventBus)
    /**
     * 注册一对 元素实例 与 SVG 元素 的关联关系
     *
     * @param {Base} element
     * @param {SVGElement} gfx
     * @param {SVGElement} [secondaryGfx] 选择其他要注册的元素
     */
    add<E extends Base>(element: E, gfx: SVGElement, secondaryGfx?: SVGElement): void

    /**
     * 从注册表中删除一个元素
     * @param element
     */
    remove<E extends Base>(element: E): void

    /**
     * 更新元素的id
     * @param element
     * @param newId {string} 新id
     */
    updateId<E extends Base>(element: E, newId: string): void

    /**
     * 更新元素的图形元素
     * @param element {Base}
     * @param gfx {SVGElement}
     * @param [secondary] {boolean}
     */
    updateGraphics<E extends Base>(element: E, gfx: SVGElement, secondary?: boolean): void

    /**
     * 返回给定id或图形对应的元素实例
     * @param filter {string | SVGElement}
     * @return {Base}
     */
    get<E extends Base>(filter: string | SVGElement): E

    /**
     * 根据传入的回调函数，返回所有符合条件的元素，类似数组的filter方法
     * @param fn {Function}
     * @return {Array<Base>}
     */
    filter<E extends Base>(fn: (element: E) => boolean): E[]

    /**
     * 根据传入的回调函数，返回第一个符合条件的元素，find
     * @param fn {Function}
     * @return {Base}
     */
    find<E extends Base>(fn: (element: E) => boolean): E

    /**
     * 获取所有注册的元素实例
     * @return {Array<Base>}
     */
    getAll<E extends Base>(): E[]

    /**
     * 根据传入的回调函数，类似数组的forEach方法
     * @param fn {Function}
     */
    forEach<E extends Base>(fn: (element: E) => void): void

    /**
     * 返回元素或其id的图形表示
     * @param filter {string | Base}
     * @param [secondary] {boolean}
     */
    getGraphics<E extends Base>(filter: E | string, secondary?: boolean): SVGElement

    /**
     * 验证id合法性
     * @param {string} id
     *
     * @throws {Error} if id is empty or already assigned
     */
    protected _validateId(id: string): void
  }
}
// 事件总线
declare module 'diagram-js/lib/core/EventBus' {
  import { Base } from 'diagram-js/lib/model'
  import { Viewbox } from 'diagram-js/lib/core/Canvas'

  export interface InternalEvent {
    cancelBubble?: boolean
    defaultPrevented?: boolean
    init(data: any): void
    stopPropagation(): void
    preventDefault(): void
    [field: string]: any
  }

  export type EventCallback<T extends string, E extends Base> = (
    event: EventType<T, E>,
    data: any
  ) => any
  export type EventType<T extends string, E extends Base> = EventMap<E> extends Record<T, infer P>
    ? P
    : InternalEvent

  type EventMap<E extends Base> = Record<
    string,
    SelectionEvent<E> | ElementEvent<E> | CanvasEvent<E>
  >
  // interface EventMap<E extends Base> {
  //   [event: string]: SelectionEvent<E> | ElementEvent<E> | CanvasEvent<E>
  // }

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
  export interface CanvasEvent<E extends Base> extends InternalEvent {
    viewbox: Viewbox
  }

  export default class EventBus {
    private _listeners: Record<string, EventCallback<string, Base>[]>

    /**
     * 注册一个事件监听器
     *
     * 在回调函数中 返回 false 可以阻止事件的后续传播
     *
     * 设置 priority 优先级，数值越大，优先级越高，优先级相同的事件会按照注册顺序依次执行，优先级越高越先执行
     *
     * 可以通过设置高 priority 来阻止该同名事件的其他事件回调的执行
     *
     * @param {string|Array<string>} events
     * @param {number} [priority=1000] the priority in which this listener is called, larger is higher
     * @param {Function} callback
     * @param {Object} [that] Pass context (`this`) to the callback
     */
    on<T extends string, E extends Base>(
      events: T,
      priority: number | EventCallback<T, E>,
      callback?: EventCallback<T, E>,
      that?: any
    ): void

    /**
     * 注册一个只执行一次的事件监听器
     * @param {string} event
     * @param {number} [priority=1000] the priority in which this listener is called, larger is higher
     * @param {Function} callback the callback to execute
     * @param {Object} [that] Pass context (`this`) to the callback
     */
    once<T extends string, E extends Base>(
      event: T,
      priority: number,
      callback: EventCallback<T, E>,
      that?: Object
    ): void

    /**
     * 通过事件和回调删除事件侦听器。
     *
     * 如果未给出回调函数，则将删除给定事件名称的所有侦听器。
     * @param {string|Array<string>} events
     * @param {Function} [callback]
     */
    off<T extends string, E extends Base>(
      events: string | string[],
      callback?: EventCallback<T, E>
    ): void

    /**
     * 创建EventBus事件
     * @param data
     * @returns {InternalEvent}
     */
    createEvent(data?: any): InternalEvent

    /**
     * 触发一个命名事件。
     * @param name {string | { type: string }} 事件名称
     * @param [data] {*} 事件参数
     * @returns {boolean}
     */
    fire(name: string | { type: string }, data?: any): boolean

    /**
     * 抛出错误事件，触发 error 事件
     * @param error
     */
    handleError(error: any): boolean

    // 清空 _listeners
    protected _destroy(): void
    protected _invokeListeners(event: string, args: any[], listener: any): void
    protected _invokeListener(event: string, args: any[], listener: any): void
    protected _addListener(event: string, newListener: any): void
    protected _getListeners(name: string): void
    protected _setListeners(name: string): void
    protected _removeListener(event: string, callback: () => void): void
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
  import { Injector, ModuleConstructor } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import CommandHandler from 'diagram-js/lib/command/CommandHandler'

  export type CommandContext = {
    context: Base
    oldValues: Record<string, any>
    newValues: Record<string, any>
  }
  export type Command = string

  export default class CommandStack extends ModuleConstructor {
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
  import { ModuleConstructor } from 'didi'

  export default abstract class CommandInterceptor extends ModuleConstructor {
    protected constructor(eventBus: EventBus)
    on(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority: number | Function,
      handler: Function,
      unwrap: boolean
    ): void
    canExecute(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): boolean
    preExecute(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    preExecuted(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    execute(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    executed(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    postExecute(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    postExecuted(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    revert(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
    reverted(
      events: Function | number | string | string[],
      hook: string | number | Function,
      priority?: number | Function,
      handler?: Function,
      unwrap?: boolean,
      that?: Object
    ): void
  }
}
/************************************** Diagram Draw 元素绘制模块 *****************************************/
// 抽象类 基础渲染器
declare module 'diagram-js/lib/draw/BaseRenderer' {
  import { Base, Connection, Shape } from 'diagram-js/lib/model'
  import { ModuleConstructor } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default abstract class BaseRenderer extends ModuleConstructor {
    constructor(eventBus: EventBus, renderPriority?: number)
    abstract canRender<E extends Base>(element: E): boolean
    abstract drawShape<E extends Shape>(visuals: SVGElement, element: E): SVGRectElement
    abstract drawConnection<E extends Connection>(
      visuals: SVGElement,
      connection: E
    ): SVGPolylineElement
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
  import { ModuleConstructor } from 'didi'

  export default class DefaultRenderer extends ModuleConstructor implements BaseRenderer {
    constructor(eventBus: EventBus, styles: Styles, DEFAULT_RENDER_PRIORITY?: number)
    CONNECTION_STYLE: Traits
    SHAPE_STYLE: Traits
    FRAME_STYLE: Traits
    canRender(): boolean
    drawShape<E extends Shape>(visuals: SVGElement, element: E, attrs?: Object): SVGRectElement
    drawConnection<E extends Connection>(
      visuals: SVGElement,
      connection: E,
      attrs?: Object
    ): SVGPolylineElement
    getShapePath<E extends Shape>(shape: E): string
    getConnectionPath<E extends Connection>(connection: E): string
  }
}
// 默认渲染样式
declare module 'diagram-js/lib/draw/Styles' {
  export type Traits = {
    [styleName: string]: string | number | Traits
  }
  export default class Styles {
    constructor(priority?: number)
    cls(className: string, traits?: string[], additionalAttrs?: Object): Traits & { class: string }
    style(traits?: string[], additionalAttrs?: Object): Traits
    computeStyle(custom?: Object | null, traits?: string[] | Traits, defaultStyles?: Object): Traits
  }
}
/************************************** Diagram Model 元素 声明 *****************************************/
// 元素模型定义
declare module 'diagram-js/lib/model' {
  import { KeyboardConfig } from 'diagram-js/lib/features/keyboard/Keyboard'
  import { Descriptor, Moddle } from 'moddle'
  import { ModuleDeclaration } from 'didi'

  export interface Hints {
    connectionStart?: Point
    connectionEnd?: Point
    source?: Point
    target?: Point
    attach?: boolean
    connection?: Connection | Object
    connectionParent?: Base
    waypoints?: Point[]
    noLayout?: boolean
    noCropping?: boolean
    noNoop?: boolean
  }

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
    di?: any;
    [field: string]: any
    static hasType(element: ModdleElement, type?: string): boolean
  }

  export interface Base {
    id: string
    type: string
    width?: number
    height?: number
    parent: Base
    label: Label
    labels: Label[]
    businessObject: ModdleElement
    outgoing: Connection[]
    incoming: Connection[]
  }

  export interface Shape extends Base {
    children: Base[]
    attachers: Shape[]
    collapsed?: boolean
    hidden?: boolean
    x?: number
    y?: number
    host?: Shape
  }

  export interface Root extends Shape {}

  export interface Label extends Shape {
    labelTarget: Base
  }

  export interface Connection extends Base {
    source: Base
    target: Base
    waypoints?: Point[]
  }

  export type ViewerOptions<E extends Element> = {
    keyboard?: KeyboardConfig<E>
    container?: string | E
    width?: string | number
    height?: string | number
    position?: string
    deferUpdate?: boolean
    modules?: ModuleDeclaration[]
    additionalModules?: any[]
    moddleExtensions?: Record<string, any>
    propertiesPanel?: {
      parent: string | E
    }
    [field: string]: any
  }
}
/************************************** Diagram layout 布局模块 *****************************************/
// 基本连接布局实现，通过直接连接 mid (源中间位置) 和 mid (目标中间位置) 来布局连接。
declare module 'diagram-js/lib/layout/BaseLayouter' {
  import { Connection, Point, Hints } from 'diagram-js/lib/model'
  export default class BaseLayouter {
    constructor()
    layoutConnection(connection: Connection, hints?: Hints): [Point, Point]
  }
}
// 用于检索航路点信息的连接的布局组件
declare module 'diagram-js/lib/layout/ConnectionDocking' {
  import { Base, Connection, Shape, Point, Hints } from 'diagram-js/lib/model'

  export interface DockingPointDescriptor {
    point: Point
    actual: Point
    idx: number
  }

  export default class ConnectionDocking {
    constructor()
    getCroppedWaypoints(connection: Connection, source?: Base, target?: Base): Point[]
    getDockingPoint(
      connection: Connection,
      shape: Shape,
      dockStart?: boolean
    ): DockingPointDescriptor
  }
}
// 根据 ConnectionDocking 计算出来的连线锚点进行连接
declare module 'diagram-js/lib/layout/CroppingConnectionDocking' {
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'
  import { Base, Connection, Shape, Point, Hints } from 'diagram-js/lib/model'
  import { DockingPointDescriptor } from 'diagram-js/lib/layout/ConnectionDocking'
  import { ModuleConstructor } from 'didi'

  export default class CroppingConnectionDocking extends ModuleConstructor {
    constructor(elementRegistry: ElementRegistry, graphicsFactory: GraphicsFactory)
    private _getIntersection(shape: Shape, connection: Connection, takeFirst: boolean): Point
    private _getConnectionPath(connection: Connection): string
    private _getShapePath(shape: Shape): string
    private _getGfx(element: Base): SVGElement
    /*获取连接的实际航路点 (可见的连接点)*/
    getCroppedWaypoints(connection: Connection, source?: Base, target?: Base): Point[]
    /*返回指定形状上的连接对接点*/
    getDockingPoint(
      connection: Connection,
      shape: Shape,
      dockStart?: boolean
    ): DockingPointDescriptor
  }
}
/************************************** Diagram translate 翻译模块 *****************************************/
declare module 'diagram-js/lib/i18n/translate' {
  export type Translate = (template: string, replacements?: Record<string, string>) => string
}
/************************************** Diagram feature 扩展功能模块 *****************************************/
// 基本建模器，提供基础操作方法，内部方法都继承 CommandHandler 来实现
declare module 'diagram-js/lib/features/modeling/Modeling' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import CommandStack from 'diagram-js/lib/command/CommandStack'
  import CommandHandler from 'diagram-js/lib/command/CommandHandler'
  import { Base, Connection, Label, Shape, Hints } from 'diagram-js/lib/model'
  import { Dimensions, Position } from 'diagram-js/lib/core/Canvas'
  import { ModuleConstructor } from 'didi'

  export class ModelingHandler extends ModuleConstructor implements CommandHandler {
    constructor(modeling: Modeling)
    canExecute(context: Object): boolean
    execute<E extends Base>(context: Object): E[]
    postExecute(context: Object): void
    preExecute(context: Object): void
    revert<E extends Base>(context: Object): E[]
  }

  export default class Modeling {
    constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: CommandStack)
    getHandlers<H extends ModelingHandler>(): Record<string, H>
    registerHandlers(commandStack: CommandStack[]): void
    moveShape(
      shape: Base,
      delta: Position,
      newParent: Base,
      newParentIndex?: number,
      hints?: Hints
    ): void
    updateAttachment(shape: Base, newHost?: Base): void
    moveElements(shapes: Base[], delta: Position, target?: Base, hints?: Hints): void
    moveConnection(
      connection: Base,
      delta: Position,
      newParent: Base,
      newParentIndex?: number,
      hints?: Hints
    ): void
    layoutConnection(connection: Base, hints?: Hints): void
    createConnection(
      source: Base,
      target: Base,
      parentIndex: number | Connection | Object,
      connection: Connection | Object,
      parent: Base | Object,
      hints?: Hints
    ): Connection
    createShape(
      shape: Shape | Object,
      position: Position,
      target: Base,
      parentIndex?: number,
      hints?: Hints
    ): Shape
    createElements(
      elements: Base[],
      position: Position,
      target: Base,
      parentIndex?: number,
      hints?: Hints
    ): Base[]
    createLabel(labelTarget: Base, position: Position, label: Base, parent?: Base): Label
    appendShape(
      source: Base,
      shape: Base | Object,
      position: Position,
      target: Base,
      hints?: Hints
    ): Shape
    removeElements(elements: Base[]): void
    distributeElements(groups: Base[], axis: string, dimension: Dimensions): void
    removeShape(shape: Shape, hints?: Hints): void
    removeConnection(connection: Connection, hints?: Hints): void
    replaceShape(oldShape: Shape, newShape: Shape, hints?: Hints): Shape
    alignElements(elements: Base[], alignment: string): void
    resizeShape(shape: Shape, newBounds: Dimensions, minBounds?: Dimensions, hints?: Hints): void
    createSpace(
      movingShapes: Base[],
      resizingShapes: Base[],
      delta: Position,
      direction: string,
      hints?: Hints
    ): void
    updateWaypoints(connection: Connection, newWaypoints: Position[], hints?: Hints): void
    reconnect(
      connection: Connection,
      source: Shape,
      target: Shape,
      dockingOrPoints: Position | Position[],
      hints?: Hints
    ): void
    reconnectStart(
      connection: Connection,
      newSource: Shape,
      dockingOrPoints: Position | Position[],
      hints?: Hints
    ): void
    reconnectEnd(
      connection: Connection,
      newTarget: Shape,
      dockingOrPoints: Position | Position[],
      hints?: Hints
    ): void
    connect(source: Shape, target: Shape, attrs?: Object, hints?: Hints): Connection
    toggleCollapse(shape: Shape, hints?: Hints): void
  }
}
// 元素对其
declare module 'diagram-js/lib/features/align-elements/AlignElements' {
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import { Base } from 'diagram-js/lib/model'
  import { ModuleConstructor } from 'didi'

  export default class AlignElements extends ModuleConstructor {
    constructor(modeling: Modeling)

    /**
     * 对选择的元素进行对齐, 内部会调用 modeling.alignElements
     *
     * @param  {Array} elements
     * @param  {string} type 可选值：left|right|center|top|bottom|middle
     */
    trigger(elements: Base[], type: string): void
  }
}
// 元素拖动时的标记支持, 内部依赖 movePreview 实现 svg 可见元素的添加
declare module 'diagram-js/lib/features/attach-support/AttachSupport' {
  import { Injector } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor'

  export default class AttachSupport extends CommandInterceptor {
    constructor(
      injector: Injector,
      eventBus: EventBus,
      canvas: Canvas,
      rules: Rules,
      modeling: Modeling
    )
  }
}
// 元素自动分布
declare module 'diagram-js/lib/features/auto-place/AutoPlace' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { Hints, Shape } from 'diagram-js/lib/model'
  import { ModuleConstructor } from 'didi'

  export default class AutoPlace extends ModuleConstructor {
    constructor(eventBus: EventBus, modeling: Modeling, canvas: Canvas)
    /**
     * 将元素添加到 source 元素中的合适位置
     * @param {Shape} source
     * @param {Shape} shape
     * @param {Hints} hints
     * @return {Shape} appended shape
     */
    append(source: Shape, shape: Shape, hints?: Hints): Shape
  }
}
// 添加 autoPlace.end 事件监听，触发时默认选择元素
declare module 'diagram-js/lib/features/auto-place/AutoPlaceSelectionBehavior' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import { ModuleConstructor } from 'didi'

  export default class AutoPlaceSelectionBehavior extends ModuleConstructor {
    constructor(eventBus: EventBus, selection: Selection)
  }
}
// 自动调整元素大小组件，用于在创建子元素或将子元素移近父边时扩展父元素。
declare module 'diagram-js/lib/features/auto-resize/AutoResize' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor'
  import { Shape } from 'diagram-js/lib/model'
  import { Bounds } from 'diagram-js/lib/core/Canvas'

  export type TRBL = {
    top: number
    right: number
    bottom: number
    left: number
  }

  export default class AutoResize extends CommandInterceptor {
    constructor(
      eventBus: EventBus,
      elementRegistry: ElementRegistry,
      modeling: Modeling,
      rules: Rules
    )
    /**
     * 给定已将许多元素移动或添加到父项中，计算目标形状的新边界。
     * 此方法考虑当前大小，添加的元素以及为新边界提供的填充
     *
     * @param {Array<Shape>} elements
     * @param {Shape} target
     * @returns {Bounds} new bounds of the target shape
     */
    private _getOptimalBounds(elements: Shape[], target: Shape): Bounds
    /**
     * 展开符合规则、偏移和边界设定的元素
     *
     * @param {Array<Shape>} elements
     * @param {Shape|string} target
     */
    private _expand(elements: Shape[], target: Shape | string): void
    /**
     * 获取在每个方向上扩展给定形状的量, 在该实例的方法默认返回 { top: 60, bottom: 60, left: 100, right: 100 };
     * @param {Shape} shape
     * @return {TRBL}
     */
    getOffset(shape: Shape): TRBL
    /**
     * 获取在每个方向上扩展给定形状的量, 在该实例的方法默认返回 { top: 2, bottom: 2, left: 15, right: 15 };
     * @param {Shape} shape
     * @return {TRBL}
     */
    getPadding(shape: Shape): TRBL
    /**
     * 执行 resize 方法, 调用 modeling.resizeShape(shape, newBounds, null, hints) 方法执行对应逻辑
     * @param {Shape} shape
     * @param {Bounds} newBounds
     * @param {Object} [hints]
     * @param {string} [hints.autoResize]
     */
    resize(shape: Shape, newBounds: Bounds, hints?: Object): void
  }
}
// 元素自动调整大小的构造规则，可继承该类实现自定义resize规则
declare module 'diagram-js/lib/features/auto-resize/AutoResizeProvider' {
  import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider'
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class AutoResizeProvider extends RuleProvider {
    constructor(eventBus: EventBus)
    /**
     * 需要由具体子类实现的方法，返回是否可以调整形状大小, 当前直接返回 false
     * @param  {Array<Shape>} elements
     * @param  {Shape} target
     *
     * @return {boolean}
     */
    canResize(elements, target): boolean
  }
}
/**
 * 画布自动滚动。如果当前光标点接近边框，则启动画布滚动。当当前点移回滚动边框内或手动取消时取消
 * Default options :
 *   scrollThresholdIn: [ 20, 20, 20, 20 ], // 当前点距离边框的距离，小于该距离则开始滚动
 *   scrollThresholdOut: [ 0, 0, 0, 0 ], // 当前点离边框的距离
 *   scrollRepeatTimeout: 15, // 画布滚动的时间间隔
 *   scrollStep: 10 // 画布滚动步长
 *
 * Threshold order 阈值设置顺序:
 *   [ left, top, right, bottom ]
 */
declare module 'diagram-js/lib/features/auto-scroll/AutoScroll' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { Point } from 'diagram-js/lib/model'
  import { ModuleConstructor } from 'didi'

  export default class AutoScroll extends ModuleConstructor {
    constructor(config: any, eventBus: EventBus, canvas: Canvas)
    /**
     * 启动画布滚动, 创建一个定时器，每隔一定时间执行一次滚动
     */
    startScroll(point: Point): void
    // 停止画布滚动，清除定时器
    stopScroll(): void
    // 重设滚动默认设置
    setOptions(options: any): void
    // 将一个事件位置转换为画布坐标
    private _toBorderPoint(event: Event): Point
  }
}
/**
 * 向节点之间的连接线添加可编辑的拐点锚点的服务
 * 在实例化时会注册一系列监听事件，包括：
 * connection.changed, connection.remove, element.marker.update, element.mousemove
 * element.mousedown, selection.changed, element.hover, element.out, element.updateId
 */
declare module 'diagram-js/lib/features/bendpoints/Bendpoints' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import InteractionEvents from 'diagram-js/lib/features/interaction-events/InteractionEvents'
  import BendpointMove from 'diagram-js/lib/features/bendpoints/BendpointMove'
  import ConnectionSegmentMove from 'diagram-js/lib/features/bendpoints/ConnectionSegmentMove'
  import { Connection } from 'diagram-js/lib/model'
  import { ModuleConstructor } from 'didi'

  export default class Bendpoints extends ModuleConstructor {
    constructor(
      eventBus: EventBus,
      canvas: Canvas,
      interactionEvents: InteractionEvents,
      bendpointMove: BendpointMove,
      connectionSegmentMove: ConnectionSegmentMove
    )

    addHandles(connection: Connection): SVGElement
    updateHandles(connection: Connection): void
    getBendpointsContainer(element: Connection, create?: boolean): SVGElement
    getSegmentDragger(idx: string, parentGfx: SVGElement): SVGElement
  }
}
// 通过拖放移动弯曲点以添加/删除弯曲点或重新连接连接
declare module 'diagram-js/lib/features/bendpoints/BendpointMove' {
  import { Injector, ModuleConstructor } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import { Connection, Point } from 'diagram-js/lib/model'

  export default class BendpointMove extends ModuleConstructor {
    constructor(
      injector: Injector,
      eventBus: EventBus,
      canvas: Canvas,
      dragging: Dragging,
      rules: Rules,
      modeling: Modeling
    )

    start(event: Event, connection: Connection, bendpointIndex: number, insert?: boolean): void
    cropWaypoints(connection: Connection, newWaypoints: Point[]): Point[]
  }
}
// 拖动连线拐点时的预览实现
declare module 'diagram-js/lib/features/bendpoints/BendpointMovePreview' {
  import BendpointMove from 'diagram-js/lib/features/bendpoints/BendpointMove'
  import { Injector, ModuleConstructor } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'

  export default class BendpointMovePreview extends ModuleConstructor {
    constructor(
      bendpointMove: BendpointMove,
      injector: Injector,
      eventBus: EventBus,
      canvas: Canvas
    )
  }
}
// 注册拐点移动监听事件
declare module 'diagram-js/lib/features/bendpoints/BendpointSnapping' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { ModuleConstructor } from 'didi'
  export default class BendpointSnapping extends ModuleConstructor {
    constructor(eventBus: EventBus)
  }
}
// 拐点移动时的预览实现
declare module 'diagram-js/lib/features/bendpoints/ConnectionSegmentMove' {
  import { Injector, ModuleConstructor } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  export default class ConnectionSegmentMove extends ModuleConstructor {
    constructor(
      injector: Injector,
      eventBus: EventBus,
      canvas: Canvas,
      dragging: Dragging,
      graphicsFactory: GraphicsFactory,
      modeling: Modeling
    )
  }
}
// 图标更改支持
declare module 'diagram-js/lib/features/change-support/ChangeSupport' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'
  /**
   * 向图表添加更改支持，包括
   * 更改时重新绘制形状和连接线
   * @param {EventBus} eventBus
   * @param {Canvas} canvas
   * @param {ElementRegistry} elementRegistry
   * @param {GraphicsFactory} graphicsFactory
   */
  export default class ChangeSupport {
    constructor(
      eventBus: EventBus,
      canvas: Canvas,
      elementRegistry: ElementRegistry,
      graphicsFactory: GraphicsFactory
    )
  }
}
// 剪切板数据缓存
declare module 'diagram-js/lib/features/clipboard/Clipboard' {
  export default class Clipboard {
    private _data: any
    get(): any
    set(data: any): void
    clear(): any
    isEmpty(): boolean
  }
}
// 连接工具
declare module 'diagram-js/lib/features/connect/Connect' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import { Base, Point } from 'diagram-js/lib/model'
  export default class Connect {
    constructor(eventBus: EventBus, dragging: Dragging, modeling: Modeling, rules: Rules)
    /**
     * 开始连接操作
     * @param {Event} event
     * @param {Base} start
     * @param {Point} [connectionStart]
     * @param {boolean} [autoActivate=false]
     */
    start(event: Event, start: Base, connectionStart?: Point, autoActivate?: boolean): void
  }
}
// 在连接期间显示连接预览
declare module 'diagram-js/lib/features/connect/ConnectPreview' {
  import { Injector } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  // 内部依赖 connectionPreview 模块
  export default class ConnectPreview {
    constructor(injector: Injector, eventBus: EventBus, canvas: Canvas)
  }
}
// 绘制连接预览。
declare module 'diagram-js/lib/features/connection-preview/ConnectionPreview' {
  import { Injector } from 'didi'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import { Connection, Hints, Point, Shape } from 'diagram-js/lib/model'
  /**
   * 绘制连接预览。这可以使用布局和连接对接来绘制外观更好的预览(可选)
   */
  export default class ConnectionPreview {
    constructor(
      injector: Injector,
      canvas: Canvas,
      graphicsFactory: GraphicsFactory,
      elementFactory: ElementFactory
    )
    /**
     * 绘制连线预览.
     * 需要至少一个 source 和 target 元素分别作为连线起点和终点，
     * 可以通过 `connectionPreview.cleanUp()` 来清除预览
     * @param {Object} context
     * @param {Object|boolean} canConnect
     * @param {Object} hints
     * @param {Shape} [hints.source] source element
     * @param {Shape} [hints.target] target element
     * @param {Point} [hints.connectionStart] connection preview start
     * @param {Point} [hints.connectionEnd] connection preview end
     * @param {Array<Point>} [hints.waypoints] provided waypoints for preview
     * @param {boolean} [hints.noLayout] true if preview should not be laid out
     * @param {boolean} [hints.noCropping] true if preview should not be cropped
     * @param {boolean} [hints.noNoop] true if simple connection should not be drawn
     */
    drawPreview(context: Object, canConnect: Object | boolean, hints?: Hints): void
    /**
     * 在源与目标元素 或者 提供的两个点之间 绘制简单的连接线
     * @param {SVGElement} connectionPreviewGfx container for the connection
     * @param {Object} hints
     * @param {Shape} [hints.source] source element
     * @param {Shape} [hints.target] target element
     * @param {Point} [hints.connectionStart] connection preview start
     * @param {Point} [hints.connectionEnd] connection preview end
     */
    drawNoopPreview(connectionPreviewGfx: SVGElement, hints?: Hints): void
    /**
     * 返回连线起点和终点
     * @param {Point} start
     * @param {Point} end
     * @param {Shape} source
     * @param {Shape} target
     *
     * @returns {Point[]}
     */
    cropWaypoints(start: Point, end: Point, source: Shape, target: Shape): [Point, Point]
    // 删除连接预览
    cleanUp(context?: { connectionPreviewGfx?: SVGElement }): void
    /**
     * 获取两个元素之间的连接线
     * @param {Object|boolean} canConnect
     * @returns {connection}
     */
    getConnection(canConnect: Object | boolean): Connection
    // 创建连接预览元素
    createConnectionPreviewGfx(): SVGElement
    /**
     * 创建并返回简单连接线
     * @param {Point} start
     * @param {Point} end
     * @returns {SVGElement}
     */
    createNoopConnection(start: Point, end: Point): SVGElement
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
    //注册与其他组件交互所需的事件, 包括 selection.changed, element.changed, element.delete
    protected _init(): void
    /**
     * 注册一个上下文菜单提供者, 注册事件 ContextPad.getProviders 的一个监听事件，在默认 providers 中添加一个新的 provider
     * @param  {number | ContextPadProvider} [priority=1000]
     * @param  {ContextPadProvider} provider
     */
    registerProvider(priority: number | ContextPadProvider, provider?: ContextPadProvider): void
    /**
     * 返回对应元素可用的上下文菜单项
     * @param {Base} element
     * @return {Array<Record<string, ContextPadEntry>> }>} list of entries
     */
    getEntries(element: Base): Record<string, ContextPadEntry>[]
    // 切换菜单显示状态
    trigger(action: string, event: Event, autoActivate?: boolean): void
    open(element: Base, force?: boolean): void
    close(): void
    getPad(element: Base): Overlay | null
  }
}
// 元素复制粘贴功能实现
declare module 'diagram-js/lib/features/copy-paste/CopyPaste' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Create from 'diagram-js/lib/features/create/Create'
  import Clipboard from 'diagram-js/lib/features/clipboard/Clipboard'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import Mouse from 'diagram-js/lib/features/mouse/Mouse'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import { Base, Connection, Shape, Label, Point, Hints } from 'diagram-js/lib/model'

  export type CopyPasteTree = {
    [key: number]: {
      id: string
      priority: number
      [attr: string]: string | number
    }[]
  }

  export default class CopyPaste {
    constructor(
      canvas: Canvas,
      create: Create,
      clipboard: Clipboard,
      elementFactory: ElementFactory,
      eventBus: EventBus,
      modeling: Modeling,
      mouse: Mouse,
      rules: Rules
    )

    /**
     * 复制元素
     * 触发 copyPaste.canCopyElements 获取返回值判断是否可以复制
     * 触发 copyPaste.elementsCopied 表示元素已经复制
     * @param {Array<Base>} elements
     * @returns {Object}
     */
    copy(elements): Object
    /**
     * 粘贴元素
     * 触发 copyPaste.pasteElements
     * @param {Object} [context]
     * @param {Base} [context.element] - Parent.
     * @param {Point} [context.point] - Position.
     * @param {Object} [context.hints] - Hints.
     */
    paste(context?: { element?: Base; point?: Point; hints?: Object }): void
    /**
     * 直接粘贴元素到某个位置
     * @param {Array<Base>} elements
     * @param {Base} target
     * @param {Point} position
     * @param {Object} [hints]
     */
    private _paste(elements: Base[], target: Base, position: Point, hints?: Hints)
    /**
     * 根据已复制的元素树型数组 遍历创建新元素, 返回创建好的元素数组
     * 会频繁触发 copyPaste.pasteElement
     * @param {Array} tree
     * @returns {Array<Base>}
     */
    private _createElements(tree: CopyPasteTree[]): Base[]
    // 创建一个新的连线元素
    createConnection(attrs?: Object): Connection
    // 创建一个新的形状元素
    createShape(attrs?: Object): Shape
    // 创建一个新的Label元素
    createLabel(attrs?: Object): Label
    /**
     * 检查元素是否与其他元素 (例如附件，标签和连接) 有关系
     * @param  {Object} element
     * @param  {Array<Base>} elements
     * @returns {boolean}
     */
    hasRelations(element: Object, elements: Base[]): boolean
    /**
     * 根据元素创建树状结构
     * @param {Array<Base>} elements
     * @returns {Object}
     */
    createTree(elements: Base[]): CopyPasteTree
  }
}
// 通过拖放创建新元素
declare module 'diagram-js/lib/features/create/Create' {
  import { Base } from 'diagram-js/lib/model'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import Rules from 'diagram-js/lib/features/rules/Rules'

  export default class Create {
    constructor(
      canvas: Canvas,
      dragging: Dragging,
      eventBus: EventBus,
      modeling: Modeling,
      rules: Rules
    )
    start<T extends Base>(event: string | Event, elements: T | T[], context?: any): void
  }
}
// 元素创建过程中的连线预览
declare module 'diagram-js/lib/features/create/CreateConnectPreview' {
  import { Injector } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'

  // 内部依赖 connectionPreview 实例，监听 create.move 事件 通过 connectionPreview.drawPreview 创建连线预览
  export default class CreateConnectPreview {
    constructor(injector: Injector, eventBus: EventBus)
  }
}
// 元素创建预览
declare module 'diagram-js/lib/features/create/CreatePreview' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'
  import PreviewSupport from 'diagram-js/lib/features/preview-support/PreviewSupport'
  import Styles from 'diagram-js/lib/draw/Styles'
  // 监听 create.move 事件
  export default class CreatePreview {
    constructor(
      canvas: Canvas,
      eventBus: EventBus,
      graphicsFactory: GraphicsFactory,
      previewSupport: PreviewSupport,
      styles: Styles
    )
  }
}
// 分组和过滤元素，然后触发均匀分布。
declare module 'diagram-js/lib/features/distribute-elements/DistributeElements' {
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import { Base } from 'diagram-js/lib/model'

  export type ElementRange = {
    min: number
    max: number
  }
  export type RangeGroup = {
    range: ElementRange
    elements: Base[]
  }
  export type RangeGroups = RangeGroup[]
  export type Orientation = 'horizontal' | 'vertical'

  export default class DistributeElements {
    constructor(modeling: Modeling)
    private _filters: Function[]
    /**
     * 寄存器过滤功能，允许外部各方过滤掉某些元素, 会将该方法添加到 _filters 属性中
     * @param  {Function} filterFn
     */
    registerFilter(filterFn: Function): void
    /**
     * 以给定的方向均匀分布元素
     * @param  {Array<Base>} elements
     * @param  {string} orientation
     */
    trigger(elements: Base[], orientation: Orientation): undefined | RangeGroups
    /**
     * 使用外部方提供的过滤器过滤元素
     * @param  {Base[]} elements
     * @return {Base[]}
     */
    _filterElements(elements: Base[]): Base[]
    /**
     * 创建范围 (最小，最大) 组。还尝试将共享相同范围的元素组合在一起
     * @param  {Base[]} elements
     * @return {RangeGroups}
     */
    _createGroups(elements: Base[]): RangeGroups
    /**
     * 将方向映射到相应的轴和尺寸
     * @param  {Orientation} direction
     */
    _setOrientation(direction: Orientation): void
    /**
     * 检查两个元素范围是否有交叉
     * @param  {ElementRange} rangeA {min, max}
     * @param  {ElementRange} rangeB {min, max}
     * @return {boolean}
     */
    _hasIntersection(rangeA: ElementRange, rangeB: ElementRange): boolean
    /**
     * 返回元素所占位置的最小值和最大值
     * @param  {Base} element
     * @return {{ min: number, max: number }}
     */
    _findRange(element: Base): ElementRange
  }
}
// 触发 canvas 话不内 拖动事件并实现一般 “拖放” 事件的操作。会在不同生命周期中通过 eventBus 触发不同的事件。
declare module 'diagram-js/lib/features/dragging/Dragging' {
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'

  export default class Dragging {
    constructor(
      eventBus: EventBus,
      canvas: Canvas,
      selection: Selection,
      elementRegistry: ElementRegistry
    )
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
// 一种接口，通过将请求触发操作的人和触发器本身解耦，提供对建模操作的访问。
// 可以通过将新操作注册到 'registerAction' 来添加新操作，并同样使用 'unregisterAction' 取消注册现有操作。
declare module 'diagram-js/lib/features/editor-actions/EditorActions' {
  import { Injector } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  export default class EditorActions {
    constructor(eventBus: EventBus | Injector, injector?: Injector)
    // 初始化可用操作对象Map
    protected _actions: Record<string, Function>

    /**
     * 注册所有默认的操作事件
     * 通过 injector 实例获取相关实例, 默认依赖 commandStack, modeling, selection, zoomScroll,
     * copyPaste, canvas, rules, keyboardMove, keyboardMoveSelection
     * 默认注册的操作:
     * undo, redo, copy, paste, stepZoom, zoom, removeSelection, moveCanvas, moveSelection,
     * @param injector
     */
    _registerDefaultActions(injector: Injector): void
    /**
     * Registers a collections of actions.
     * The key of the object will be the name of the action.
     *
     * @example
     * ´´´
     * var actions = {
     *   spaceTool: function() {
     *     spaceTool.activateSelection();
     *   },
     *   lassoTool: function() {
     *     lassoTool.activateSelection();
     *   }
     * ];
     *
     * editorActions.register(actions);
     *
     * editorActions.isRegistered('spaceTool'); // true
     * ´´´
     *
     * @param  { Record<string, Function> | string} actions
     * @param  {Function} [listener]
     */
    register(actions: string | Record<string, Function>, listener?: Function): void
    // 触发操作
    trigger(action: string, opts?: Object): unknown
    // 取消注册的某个操作事件
    unregister(action: string): unknown
    // 返回当前已注册的操作数量
    getActions(): number
    // 检查是否注册了给定的操作
    isRegistered(action: string): boolean
  }
}
// 全局任意创建连线的工具
declare module 'diagram-js/lib/features/global-connect/GlobalConnect' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import Connect from 'diagram-js/lib/features/connect/Connect'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import ToolManager from 'diagram-js/lib/features/tool-manager/ToolManager'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import Mouse from 'diagram-js/lib/features/mouse/Mouse'
  export default class GlobalConnect {
    constructor(
      eventBus: EventBus,
      dragging: Dragging,
      connect: Connect,
      canvas: Canvas,
      toolManager: ToolManager,
      rules: Rules,
      mouse: Mouse
    )
  }
}
// 基本的格式调整事件监听注册，包括连接，创建，移动，调整形状，移动弯曲点和连接等
declare module 'diagram-js/lib/features/grid-snapping/GridSnapping' {
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import EventBus from 'diagram-js/lib/core/EventBus'
  /**
   * 基本的格式调整事件监听注册，包括连接，创建，移动，调整形状，移动弯曲点和连接等
   * 可以通过设置 config 参数 {gridSnapping: { active: false }} 来禁用格式调整
   * 默认监听以下事件：
   * 'create.move',
   * 'create.end',
   * 'bendpoint.move.move',
   * 'bendpoint.move.end',
   * 'connect.move',
   * 'connect.end',
   * 'connectionSegment.move.move',
   * 'connectionSegment.move.end',
   * 'resize.move',
   * 'resize.end',
   * 'shape.move.move',
   * 'shape.move.end'
   */
  export default class GridSnapping {
    constructor(elementRegistry: ElementRegistry, eventBus: EventBus, config: any)
    /**
     * 捕捉事件x或y。可选设置 最小值、最大值和偏移量
     * @param {Object} event
     * @param {string} axis
     * @param options
     * @param {number} [options.min]
     * @param {number} [options.max]
     * @param {number} [options.offset]
     */
    snapEvent(
      event: Object,
      axis: string,
      options?: { min?: number; max?: number; offset?: number }
    ): void
    /**
     * 为第三方扩展模块 公开网格间距
     * @return {number} spacing of grid dots
     */
    getGridSpacing(): number
    /**
     * 具有可选的最小值、最大值和偏移量的捕捉值
     * @param {number} value
     * @param {Object} options
     * @param {number} [options.min]
     * @param {number} [options.max]
     * @param {number} [options.offset]
     */
    snapValue(value: number, options?: { min?: number; max?: number; offset?: number }): number
    isActive(): boolean
    setActive(active: boolean): void
    toggleActive(): void
  }
}
// 网格化生成器
declare module 'diagram-js/lib/features/grid-snapping/visuals/Grid' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  /**
   * 背景网格工具
   * 在 diagram 初始化时初始化一个背景网格（画布容器大小）
   * 默认网格尺寸 100000 * 100000
   *
   */
  export default class Grid {
    constructor(canvas: Canvas, eventBus: EventBus)
  }
}
//
declare module 'diagram-js/lib/features/grid-snapping/behavior/ResizeBehavior' {
  export default class ResizeBehavior {}
}
//
declare module 'diagram-js/lib/features/grid-snapping/behavior/SpaceToolBehavior' {
  export default class SpaceToolBehavior {}
}
//
declare module 'diagram-js/lib/features/hand-tool/HandTool' {
  export default class HandTool {}
}
//
declare module 'diagram-js/lib/features/hover-fix/HoverFix' {
  export default class HoverFix {}
}
//
declare module 'diagram-js/lib/features/interaction-events/InteractionEvents' {
  export default class InteractionEvents {}
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
//
declare module 'diagram-js/lib/features/keyboard-move-selection/KeyboardMoveSelection' {
  export default class KeyboardMoveSelection {}
}
//
declare module 'diagram-js/lib/features/label-support/LabelSupport' {
  export default class LabelSupport {}
}
//
declare module 'diagram-js/lib/features/lasso-tool/LassoTool' {
  export default class LassoTool {}
}
//
declare module 'diagram-js/lib/features/mouse/Mouse' {
  export default class Mouse {}
}
//
declare module 'diagram-js/lib/features/move/Move' {
  export default class Move {}
}
//
declare module 'diagram-js/lib/features/move/MovePreview' {
  export default class MovePreview {}
}
//
declare module 'diagram-js/lib/features/ordering/OrderingProvider' {
  export default class OrderingProvider {}
}
//
declare module 'diagram-js/lib/features/outline/Outline' {
  export default class Outline {}
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
  export type PaletteEntryDescriptor = Record<string, PaletteEntry>

  export default class Palette {
    constructor(eventBus: EventBus, canvas: Canvas)
    registerProvider(priority: number | PaletteProvider, provider?: PaletteProvider): void
    getEntries(element: Base): PaletteEntryDescriptor
    trigger(action: string, event: Event, autoActivate?: boolean): void
    open(): void
    close(): void
    toggle(): void
    isOpen(): boolean
    isActiveTool(tool: string): boolean
    updateToolHighlight(name: string): void
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
    registerProvider(
      id: string,
      priority: number | PopupMenuProvider,
      provider?: PopupMenuProvider
    ): void
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
// 增加对移动 / 调整大小元素预览的支持
declare module 'diagram-js/lib/features/preview-support/PreviewSupport' {
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Styles from 'diagram-js/lib/draw/Styles'
  import { Base } from 'diagram-js/lib/model'

  export default class PreviewSupport {
    constructor(
      elementRegistry: ElementRegistry,
      eventBus: EventBus,
      canvas: Canvas,
      styles: Styles
    )
    protected _clonedMarkers: Object
    getGfx<E extends Base>(element: E): SVGElement
    addDragger<E extends Base>(element: E, group: SVGElement, gfx?: SVGElement): SVGElement
    addFrame<E extends Base>(element: E, group: SVGElement): SVGElement
  }
}
// 允许替换元素类型的服务
declare module 'diagram-js/lib/features/replace/Replace' {
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import { Base, Shape } from 'diagram-js/lib/model'

  export default class Replace {
    constructor(modeling: Modeling)
    replaceElement<E extends Base, S extends Shape>(
      oldElement: E,
      newElement: Object | E,
      options?: Object
    ): S
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
    activate<E extends Shape>(
      event: MouseEvent,
      shape: E,
      contextOrDirection: Object | string
    ): void
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
//
declare module 'diagram-js/lib/features/root-elements/RootElementsBehavior' {
  export default class RootElementsBehavior {}
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
declare module 'diagram-js/lib/features/rules/RuleProvider' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor'

  export default class RuleProvider extends CommandInterceptor {
    constructor(eventBus: EventBus)
    protected init(): void
    addRule(actions: string | string[], priority: number | Function, fn?: Function): void
  }
}
//
declare module 'diagram-js/lib/features/search-pad/SearchPad' {
  export default class SearchPad {}
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
    select(elements: SelectedElement | Array<SelectedElement>, add?: boolean): void
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
    constructor(
      eventBus: EventBus,
      selection: Selection,
      canvas: Canvas,
      elementRegistry: ElementRegistry
    )
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
//
declare module 'diagram-js/lib/features/snapping/Snapping' {
  export default class Snapping {}
}
//
declare module 'diagram-js/lib/features/snapping/SnapContext' {
  export default class SnapContext {}
}
//
declare module 'diagram-js/lib/features/snapping/ResizeSnapping' {
  export default class ResizeSnapping {}
}
//
declare module 'diagram-js/lib/features/snapping/CreateMoveSnapping' {
  export default class CreateMoveSnapping {}
}
//
declare module 'diagram-js/lib/features/space-tool/SpaceTool' {
  export default class SpaceTool {}
}
//
declare module 'diagram-js/lib/features/space-tool/SpaceToolPreview' {
  export default class SpaceToolPreview {}
}
//
declare module 'diagram-js/lib/features/tool-manager/ToolManager' {
  export default class ToolManager {}
}
//
declare module 'diagram-js/lib/features/tooltips/Tooltips' {
  export default class Tooltips {}
}
//
declare module 'diagram-js/lib/features/touch/TouchFix' {
  export default class TouchFix {}
}
//
declare module 'diagram-js/lib/features/touch/TouchInteractionEvents' {
  export default class TouchInteractionEvents {}
}

/*************************************** 123123 ****************************************/
//
declare module 'diagram-js/lib/navigation/keyboard-move/KeyboardMove' {
  export default class KeyboardMove {}
}
//
declare module 'diagram-js/lib/navigation/movecanvas/MoveCanvas' {
  export default class MoveCanvas {}
}
//
declare module 'diagram-js/lib/navigation/zoomscroll/ZoomScroll' {
  export default class ZoomScroll {}
}
