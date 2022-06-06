/************************************* 基础扩展功能定义 *************************************/
declare module 'bpmn-js' {
  import BaseViewer from 'bpmn-js/lib/BaseViewer'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export default class Viewer extends BaseViewer {
    constructor(options?: ViewerOptions<Element>)
  }
}
declare module 'bpmn-js/lib/BaseViewer' {
  import Diagram from 'diagram-js'
  import { EventCallback } from 'diagram-js/lib/core/EventBus'
  import { ViewerOptions, ModdleElement } from 'diagram-js/lib/model'
  import { InternalEvent } from 'diagram-js/lib/core/EventBus'
  import { ModuleDefinition } from 'didi'

  export interface WriterOptions {
    format?: boolean
    preamble?: boolean
  }
  export interface DoneCallbackOpt {
    warnings: any[]
    xml: string
    err?: any
  }
  export type BPMNEvent = string
  export type BPMNEventCallback<P extends InternalEvent> = (params: P) => void

  export default class BaseViewer extends Diagram {
    constructor(options?: ViewerOptions<Element>)
    importXML(xml: string): Promise<DoneCallbackOpt>
    open(diagram: string): Promise<DoneCallbackOpt>
    saveXML(options?: WriterOptions): Promise<DoneCallbackOpt>
    saveSVG(options?: WriterOptions): Promise<DoneCallbackOpt>
    clear(): void
    destroy(): void
    on<T extends BPMNEvent, P extends InternalEvent>(
      event: T,
      priority: number | BPMNEventCallback<P>,
      callback?: EventCallback<T, any>,
      that?: this
    ): void
    off<T extends BPMNEvent, P extends InternalEvent>(
      events: T | T[],
      callback?: BPMNEventCallback<P>
    ): void
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

  export default class NavigatedViewer extends Viewer {
    constructor(options?: ViewerOptions<Element>)
  }
}
declare module 'bpmn-js/lib/BaseModeler' {
  import Viewer from 'bpmn-js'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export default class BaseModeler extends Viewer {
    constructor(options?: ViewerOptions<Element>)
  }
}
declare module 'bpmn-js/lib/Modeler' {
  import BaseModeler from 'bpmn-js/lib/BaseModeler'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export default class Modeler extends BaseModeler {
    constructor(options?: ViewerOptions<Element>)
    createDiagram(): void // 创建流程图
  }
}
/************************************* core 核心模块( draw, import) *************************************/
//
declare module 'bpmn-js/lib/core' {}
/************************************* draw 图形元素绘制模块 *************************************/
// bpmn 元素核心绘制模块
declare module 'bpmn-js/lib/draw/BpmnRenderer' {
  import Canvas, { Position } from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
  import Styles from 'diagram-js/lib/draw/Styles'
  import PathMap from 'bpmn-js/lib/draw/PathMap'
  import TextRenderer from 'bpmn-js/lib/draw/TextRenderer'
  import { Base, Connection, Shape } from 'diagram-js/lib/model'

  export type RendererHandler = <E extends Base>(
    parentGfx: SVGElement,
    element: E,
    options?: Position | Object
  ) => SVGElement
  export type RendererType =
    | 'bpmn:Event'
    | 'bpmn:StartEvent'
    | 'bpmn:MessageEventDefinition'
    | 'bpmn:TimerEventDefinition'
    | 'bpmn:EscalationEventDefinition'
    | 'bpmn:ConditionalEventDefinition'
    | 'bpmn:LinkEventDefinition'
    | 'bpmn:ErrorEventDefinition'
    | 'bpmn:CancelEventDefinition'
    | 'bpmn:CompensateEventDefinition'
    | 'bpmn:SignalEventDefinition'
    | 'bpmn:MultipleEventDefinition'
    | 'bpmn:ParallelMultipleEventDefinition'
    | 'bpmn:EndEvent'
    | 'bpmn:TerminateEventDefinition'
    | 'bpmn:IntermediateEvent'
    | 'bpmn:IntermediateCatchEvent'
    | 'bpmn:IntermediateThrowEvent'
    | 'bpmn:Activity'
    | 'bpmn:Task'
    | 'bpmn:ServiceTask'
    | 'bpmn:UserTask'
    | 'bpmn:ManualTask'
    | 'bpmn:SendTask'
    | 'bpmn:ReceiveTask'
    | 'bpmn:ScriptTask'
    | 'bpmn:BusinessRuleTask'
    | 'bpmn:SubProcess'
    | 'bpmn:AdHocSubProcess'
    | 'bpmn:Transaction'
    | 'bpmn:CallActivity'
    | 'bpmn:Participant'
    | 'bpmn:Lane'
    | 'bpmn:InclusiveGateway'
    | 'bpmn:ExclusiveGateway'
    | 'bpmn:ComplexGateway'
    | 'bpmn:ParallelGateway'
    | 'bpmn:EventBasedGateway'
    | 'bpmn:Gateway'
    | 'bpmn:SequenceFlow'
    | 'bpmn:Association'
    | 'bpmn:DataInputAssociation'
    | 'bpmn:DataOutputAssociation'
    | 'bpmn:MessageFlow'
    | 'bpmn:DataObject'
    | 'bpmn:DataObjectReference'
    | 'bpmn:DataInput'
    | 'bpmn:DataOutput'
    | 'bpmn:DataStoreReference'
    | 'bpmn:BoundaryEvent'
    | 'bpmn:Group'
    | 'label'
    | 'bpmn:TextAnnotation'
    | 'ParticipantMultiplicityMarker'
    | 'SubProcessMarker'
    | 'ParallelMarker'
    | 'SequentialMarker'
    | 'CompensationMarker'
    | 'LoopMarker'
    | 'AdhocMarker'

  export default class BpmnRenderer extends BaseRenderer {
    constructor(
      config: any,
      eventBus: EventBus,
      styles: Styles,
      pathMap: PathMap,
      canvas: Canvas,
      textRenderer: TextRenderer,
      priority?: number
    )
    protected handlers: { [rendererType in RendererType]: RendererHandler }
    protected _drawPath(parentGfx: SVGElement, element: Base, attrs?: Object): SVGElement
    protected _renderer(type: RendererType): RendererHandler
    getConnectionPath<E extends Base>(connection: E): string
    canRender<E extends Base>(element: E): boolean
    drawShape<E extends Shape>(parentGfx: SVGElement, element: E): SVGRectElement
    drawConnection<E extends Connection>(parentGfx: SVGElement, element: E): SVGPolylineElement
    getShapePath<E extends Base>(element: E): string
  }
}
// bpmn 元素图形路径字典
declare module 'bpmn-js/lib/draw/PathMap' {
  export type Path = {
    d: string
    width?: number
    height?: number
    heightElements?: number[]
    widthElements?: number[]
  }
  export type PathId =
    | 'EVENT_MESSAGE'
    | 'EVENT_SIGNAL'
    | 'EVENT_ESCALATION'
    | 'EVENT_CONDITIONAL'
    | 'EVENT_LINK'
    | 'EVENT_ERROR'
    | 'EVENT_CANCEL_45'
    | 'EVENT_COMPENSATION'
    | 'EVENT_TIMER_WH'
    | 'EVENT_TIMER_LINE'
    | 'EVENT_MULTIPLE'
    | 'EVENT_PARALLEL_MULTIPLE'
    | 'GATEWAY_EXCLUSIVE'
    | 'GATEWAY_PARALLEL'
    | 'GATEWAY_EVENT_BASED'
    | 'GATEWAY_COMPLEX'
    | 'DATA_OBJECT_PATH'
    | 'DATA_OBJECT_COLLECTION_PATH'
    | 'DATA_ARROW'
    | 'DATA_STORE'
    | 'TEXT_ANNOTATION'
    | 'MARKER_SUB_PROCESS'
    | 'MARKER_PARALLEL'
    | 'MARKER_SEQUENTIAL'
    | 'MARKER_COMPENSATION'
    | 'MARKER_LOOP'
    | 'MARKER_ADHOC'
    | 'TASK_TYPE_SEND'
    | 'TASK_TYPE_SCRIPT'
    | 'TASK_TYPE_USER_1'
    | 'TASK_TYPE_USER_2'
    | 'TASK_TYPE_USER_3'
    | 'TASK_TYPE_MANUAL'
    | 'TASK_TYPE_INSTANTIATING_SEND'
    | 'TASK_TYPE_SERVICE'
    | 'TASK_TYPE_SERVICE_FILL'
    | 'TASK_TYPE_BUSINESS_RULE_HEADER'
    | 'TASK_TYPE_BUSINESS_RULE_MAIN'
    | 'MESSAGE_FLOW_MARKER'
  export default class PathMap {
    protected pathMap: { [pathId in PathId]: Path }
    private getRawPath(pathId: string): string
    private getScaledPath(pathId: string, param: Object): Object
  }
}
// bpmn 文本渲染
declare module 'bpmn-js/lib/draw/TextRenderer' {
  import { Bounds } from 'diagram-js/lib/core/Canvas'

  export type TextStyle = {
    fontFamily: string
    fontSize: number
    fontWeight: string
    lineHeight: number
  }

  export default class TextRenderer {
    constructor(config: any)
    private getExternalLabelBounds(bounds: Bounds, text: string): Bounds
    private getTextAnnotationBounds(bounds: Bounds, text: string): Bounds
    private createText(text: string, options?: Object): SVGElement
    private getDefaultStyle(): TextStyle
    private getExternalStyle(): TextStyle
  }
}
/************************************* import 文件导入 *************************************/
// 导入
declare module 'bpmn-js/lib/import/Importer' {
  import Diagram from 'diagram-js'
  import { ModdleElement } from 'diagram-js/lib/model'
  import { DoneCallbackOpt } from 'bpmn-js/lib/BaseViewer'

  export function importBpmnDiagram(
    diagram: Diagram,
    definitions: ModdleElement,
    bpmnDiagram: ModdleElement
  ): Promise<DoneCallbackOpt>
}
//
declare module 'bpmn-js/lib/import/BpmnImporter' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import { Translate } from 'diagram-js/lib/i18n/translate'
  import { Base } from 'diagram-js/lib/model'
  import TextRenderer from 'bpmn-js/lib/draw/TextRenderer'

  export default class BpmnImporter {
    constructor(
      eventBus: EventBus,
      canvas: Canvas,
      elementFactory: ElementFactory,
      elementRegistry: ElementRegistry,
      translate: Translate,
      textRenderer: TextRenderer
    )
    add<E extends Base>(semantic: any, di: any, parentElement?: E): E
  }
}
// xml 树形结构遍历
declare module 'bpmn-js/lib/import/BpmnTreeWalker' {
  import { Translate } from 'diagram-js/lib/i18n/translate'

  export default class BpmnTreeWalker {
    constructor(handler, translate: Translate)
  }
}
/************************************* feature modeling 核心扩展功能 *************************************/
declare module 'bpmn-js/lib/features/modeling/Modeling.js' {
  import BaseModeling from 'diagram-js/lib/features/modeling/Modeling'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import CommandStack from 'diagram-js/lib/command/CommandStack'
  import { Connection, Hints, Shape } from 'diagram-js/lib/model'

  export default class Modeling extends BaseModeling {
    constructor(
      eventBus: EventBus,
      elementFactory: ElementFactory,
      commandStack: CommandStack,
      bpmnRules: any
    )
    getHandlers(): any
    updateLabel(element: any, newLabel: any, newBounds, hints): void
    connect(source: Shape, target: Shape, attrs?: Object, hints?: Hints): Connection
  }
}
// bpmn DI 元素工厂
declare module 'bpmn-js/lib/features/modeling/BpmnFactory' {
  import { Moddle } from 'moddle'
  import { Base } from 'diagram-js/lib/model'
  import { ModdleElement } from 'diagram-js/lib/model'

  export default class BpmnFactory {
    constructor(moddle: Moddle)
    protected _needsId<E extends Base>(element: E): boolean
    protected _ensureId<E extends Base>(element: E): void
    create<E extends Base>(type: string, attrs?: Object): E & ModdleElement
    createDiLabel<E extends Base>(): E
    createDiShape<E extends Base>(): E
    createDiBounds<E extends Base>(): E
    createDiWaypoints<E extends Base>(): E
    createDiWaypoint<E extends Base>(): E
    createDiEdge<E extends Base>(): E
    createDiPlane<E extends Base>(): E
  }
}
// bpmn 元素实例工厂
declare module 'bpmn-js/lib/features/modeling/ElementFactory' {
  import DiagramElementFactory from 'diagram-js/lib/core/ElementFactory'
  import { Moddle } from 'moddle'
  import { Translate } from 'diagram-js/lib/i18n/translate'
  import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory.js'
  import { Base, Connection, Label, ModdleElement, Root, Shape } from 'diagram-js/lib/model'
  import { Dimensions } from 'diagram-js/lib/core/Canvas'

  export default class ElementFactory extends DiagramElementFactory {
    constructor(bpmnFactory: BpmnFactory, moddle: Moddle, translate: Translate)
    _bpmnFactory: BpmnFactory
    _moddle: Moddle
    _translate: Translate

    baseCreate(type: string, attrs: any): Root | Shape | Connection | Label
    create<E extends Base>(elementType: string, attrs?: Object): E & ModdleElement
    createBpmnElement<E extends Base>(elementType: string, attrs?: Object): E & ModdleElement
    getDefaultSize(element, di): Dimensions
    createParticipantShape(attrs?: Object): Shape & ModdleElement
  }
}
/************************************* feature modules 扩展功能 *************************************/
// 定位
declare module 'bpmn-js/lib/features/auto-place/BpmnAutoPlace' {
  import EventBus from 'diagram-js/lib/core/EventBus'

  // 在实例化时注册一个 autoPlace 事件监听，触发时返回 要连接到源的目标元素的新位置。
  export default class BpmnAutoPlace {
    constructor(eventBus: EventBus)
  }
}
// 实现BPMN特定调整大小功能的AutoResize模块的子类。
declare module 'bpmn-js/lib/features/auto-resize/BpmnAutoResize' {
  import { Injector } from 'didi'
  import AutoResize from 'diagram-js/lib/features/auto-resize/AutoResize'
  import { Hints, Shape } from 'diagram-js/lib/model'
  import { Bounds } from 'diagram-js/lib/core/Canvas'

  export default class BpmnAutoResize extends AutoResize {
    constructor(injector: Injector)
    /**
     * 调整形状和泳道的大小
     * 根据 target 是否是 Participant 元素
     * 来确定调用 modeling.resizeLane(target, newBounds, null, hints)
     * 或者 modeling.resizeShape(target, newBounds, null, hints)
     * @param {Shape} target
     * @param {Bounds} newBounds
     * @param {Object} hints
     */
    resize(target: Shape, newBounds: Bounds, hints?: Hints): void
  }
}
// 模块是自动调整父BPMN元素大小的具体实现类
declare module 'bpmn-js/lib/features/auto-resize/BpmnAutoResizeProvider' {
  import AutoResizeProvider from 'diagram-js/lib/features/auto-resize/AutoResizeProvider'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js'
  import { Base, Shape } from 'diagram-js/lib/model'
  export default class BpmnAutoResizeProvider extends AutoResizeProvider {
    constructor(eventBus: EventBus, modeling: Modeling)
    /**
     * 检查给定的目标是否可以扩展, elements 中任意一个不能扩展则返回 false
     * @param  {Shape[]} elements
     * @param  {Shape} target
     * @return {boolean}
     */
    canResize(elements: Base[], target: Shape): boolean
  }
}
// 元素上下文菜单
declare module 'bpmn-js/lib/features/context-pad/ContextPadProvider' {
  import { Injector } from 'didi'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ContextPad from 'diagram-js/lib/features/context-pad/ContextPad'
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js'
  import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'
  import Connect from 'diagram-js/lib/features/connect/Connect'
  import Create from 'diagram-js/lib/features/create/Create'
  import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import { Translate } from 'diagram-js/lib/i18n/translate'
  import AutoPlace from 'diagram-js/lib/features/auto-place/AutoPlace'
  import { Base } from 'diagram-js/lib/model'

  type ContextPadAction = {
    group: string
    className: string
    title: string
    action: Record<string, (event: Event, element: Base) => unknown>
  }

  /**
   * 元素对应的上下文菜单
   * 实例化时添加对 autoPlace 实例的依赖
   * 注册 create.end 事件监听函数，手动触发 replace 下面的点击事件
   */
  export default class ContextPadProvider {
    constructor(
      config: any,
      injector: Injector,
      eventBus: EventBus,
      contextPad: ContextPad,
      modeling: Modeling,
      elementFactory: ElementFactory,
      connect: Connect,
      create: Create,
      popupMenu: PopupMenu,
      canvas: Canvas,
      rules: Rules,
      translate?: Translate,
      priority?: number
    )

    _contextPad: ContextPad
    _modeling: Modeling
    _elementFactory: ElementFactory
    _connect: Connect
    _create: Create
    _popupMenu: PopupMenu
    _canvas: Canvas
    _rules: Rules
    _translate: Translate
    _autoPlace: AutoPlace

    /**
     * 根据当前节点提供可见上下文菜单入口
     * 可以通过继承或者重写来增加上下文菜单可用功能
     * @param element { Base }
     * @returns {Record<string, ContextPadAction>} entries
     */
    getContextPadEntries(element: Base): Record<string, ContextPadAction>
  }
}
// bpmn 元素实例的复制粘贴
declare module 'bpmn-js/lib/features/copy-paste/BpmnCopyPaste' {
  import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ModdleCopy from 'bpmn-js/lib/features/copy-paste/ModdleCopy'

  /**
   * bpmn 元素实例的复制粘贴, 优先级指数 750
   * 初始化时注册 copyPaste.copyElement, moddleCopy.canCopyProperty,
   * copyPaste.pasteElements, copyPaste.pasteElement 事件的监听函数
   *
   */
  export default class BpmnCopyPaste {
    constructor(bpmnFactory: BpmnFactory, eventBus: EventBus, moddleCopy: ModdleCopy)
  }
}
//
declare module 'bpmn-js/lib/features/copy-paste/ModdleCopy' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory'
  import { Moddle } from 'moddle'
  import { Base, ModdleElement } from 'diagram-js/lib/model'

  /**
   * 用于将模型属性从源元素复制到目标元素。
   * 初始化时注册 moddleCopy.canCopyProperties, moddleCopy.canCopyProperty,
   * moddleCopy.canSetCopiedProperty 事件的监听函数， 对元素实例与元素属性的可复制性进行校验
   */
  export default class ModdleCopy {
    constructor(eventBus: EventBus, bpmnFactory: BpmnFactory, moddle: Moddle)
    protected _bpmnFactory: BpmnFactory
    protected _eventBus: EventBus
    protected _moddle: Moddle

    /**
     * 将源元素的模型属性复制到目标元素。
     * @param {ModdleElement} sourceElement
     * @param {ModdleElement} targetElement
     * @param {Array<string>} [propertyNames]
     * @returns {ModdleElement}
     */
    copyElement<T extends ModdleElement>(
      sourceElement: T,
      targetElement: T,
      propertyNames?: string[]
    ): T

    /**
     * Copy model property.
     *
     * @param {*} property
     * @param {ModdleElement} parent
     * @param {string} propertyName
     *
     * @returns {*}
     */
    copyProperty<T extends ModdleElement, U>(property: U, parent: T, propertyName: string): U

    // 返回copy元素对应的新id，不需要id的返回undefined
    _copyId(id: string, element: Base): string | undefined
  }
}
//
declare module 'bpmn-js/lib/features/di-ordering/BpmnDiOrdering' {
  export default class BpmnDiOrdering {}
}
// 排除bpmn定义的不可均分元素
declare module 'bpmn-js/lib/features/distribute-elements/BpmnDistributeElements' {
  import DistributeElements from 'diagram-js/lib/features/distribute-elements/DistributeElements'
  /**
   * 初始化时注册一个过滤器，默认排除以下元素：
   * 'bpmn:Association',
   * 'bpmn:BoundaryEvent',
   * 'bpmn:DataInputAssociation',
   * 'bpmn:DataOutputAssociation',
   * 'bpmn:Lane',
   * 'bpmn:MessageFlow',
   * 'bpmn:Participant',
   * 'bpmn:SequenceFlow',
   * 'bpmn:TextAnnotation'
   */
  export default class BpmnDistributeElements {
    constructor(distributeElements: DistributeElements)
  }
}
// 添加允许在折叠的子进程上切换平面的叠加层。
declare module 'bpmn-js/lib/features/drilldown/DrilldownBreadcrumbs' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import Overlays from 'diagram-js/lib/features/overlays/Overlays'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { Base } from 'diagram-js/lib/model'
  /**
   * 添加允许在折叠的子进程上切换平面的叠加层。
   * 初始化时会在画布中添加一个 `<ul class="bjs-breadcrumbs"></ul>` 标签
   * 在 element.changed, root.set 事件触发时会更新 Breadcrumbs
   */
  export default class DrilldownBreadcrumbs {
    constructor(
      eventBus: EventBus,
      elementRegistry: ElementRegistry,
      overlays: Overlays,
      canvas: Canvas
    )

    /**
     * 更新显示的面包屑。如果未提供元素，则仅更新标签
     * @param element
     * @private
     */
    private updateBreadcrumbs(element: Base): void
  }
}
// 向下钻取时，将折叠的子流程移动到视图中。
declare module 'bpmn-js/lib/features/drilldown/DrilldownCentering' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Canvas from 'diagram-js/lib/core/Canvas'
  // 向下钻取时，将折叠的子流程移动到视图中。
  // 缩放和滚动保存在会话中。
  export default class DrilldownCentering {
    constructor(eventBus: EventBus, canvas: Canvas)
  }
}
//
declare module 'bpmn-js/lib/features/drilldown/DrilldownOverlayBehavior' {
  import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import Overlays from 'diagram-js/lib/features/overlays/Overlays'
  import { Base } from 'diagram-js/lib/model'

  export default class DrilldownOverlayBehavior extends CommandInterceptor {
    constructor(
      canvas: Canvas,
      eventBus: EventBus,
      elementRegistry: ElementRegistry,
      overlays: Overlays
    )

    canDrillDown(element: Base): boolean

    /**
     * 更新向下钻入覆盖的可见性。如果平面没有元素，则仅在选择元素时才显示向下钻取。
     * @param element { Base }
     */
    updateOverlayVisibility(element: Base): void

    /**
     * 将一个向下钻入按钮附加到给定的元素上。我们假设平面与元素具有相同的id。
     * @param element { Base }
     */
    addOverlay(element: Base): void

    /**
     * 移除元素对应的 overlays 覆盖物, 调用 overlays.remove
     * @param element { Base }
     */
    removeOverlay(element: Base): void
  }
}
// 在生命周期钩子 `import.render.start` 触发时为具有折叠的子进程和所有dis在同一平面上的图创建新平面
declare module 'bpmn-js/lib/features/drilldown/SubprocessCompatibility' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Moddle } from 'moddle'
  import { Definitions } from 'bpmn-moddle'

  export default class SubprocessCompatibility {
    constructor(eventBus: EventBus, moddle: Moddle)

    protected _definitions: Definitions | undefined
    protected _processToDiagramMap: Record<string, any> | undefined

    handleImport(definitions: Definitions): void

    /**
     * 将所有DI元素从折叠的子进程移动到新平面.
     * @param {Object} plane
     * @return {Array} new diagrams created for the collapsed subprocesses
     */
    createNewDiagrams(plane: Object): any[]

    // 移动后重新定位
    movePlaneElementsToOrigin(plane: Object): void

    moveToDiPlane(diElement: Object, newPlane: Object): void

    createDiagram(bo: Object): void
  }
}
//
declare module 'bpmn-js/lib/features/editor-actions/BpmnEditorActions' {
  import { Injector } from 'didi'
  import EditorActions from 'diagram-js/lib/features/editor-actions/EditorActions'

  export default class BpmnEditorActions extends EditorActions {
    constructor(injector: Injector)

    /**
     * 注册 bpmn 相关的操作事件
     * 1. selectElements 对应的元素选中事件，默认排除根元素
     * 2. spaceTool 对应的 toggle 事件
     * 3. lassoTool 对应的 toggle 事件
     * 4. handTool 对应的 toggle 事件
     * 5. globalConnectTool 对应的 toggle 事件
     * 6. distributeElements 触发时执行 distributeElements.trigger
     * 7. alignElements 事件触发时对齐当前选中元素，执行 alignElements.trigger
     * 等等
     * @param injector
     */
    _registerDefaultActions(injector: Injector): void
  }
}
//
declare module 'bpmn-js/lib/features/grid-snapping/BpmnGridSnapping' {
  export default class BpmnGridSnapping {}
}
//
declare module 'bpmn-js/lib/features/grid-snapping/behavior/AutoPlaceBehavior' {
  export default class AutoPlaceBehavior {}
}
//
declare module 'bpmn-js/lib/features/grid-snapping/behavior/CreateParticipantBehavior' {
  export default class CreateParticipantBehavior {}
}
//
declare module 'bpmn-js/lib/features/grid-snapping/behavior/LayoutConnectionBehavior' {
  export default class LayoutConnectionBehavior {}
}
//
declare module 'bpmn-js/lib/features/interaction-events/BpmnInteractionEvents' {
  export default class BpmnInteractionEvents {}
}
//
declare module 'bpmn-js/lib/features/keyboard/BpmnKeyboardBindings' {
  export default class BpmnKeyboardBindings {}
}
//
declare module 'bpmn-js/lib/features/label-editing/LabelEditingPreview' {
  export default class LabelEditingPreview {}
}
//
declare module 'bpmn-js/lib/features/label-editing/LabelEditingProvider' {
  export default class LabelEditingProvider {}
}
//
declare module 'bpmn-js/lib/features/label-editing/cmd/UpdateLabelHandler' {
  export default class UpdateLabelHandler {}
}
//
declare module 'bpmn-js/lib/features/ordering/BpmnOrderingProvider' {
  export default class BpmnOrderingProvider {}
}
//
declare module 'bpmn-js/lib/features/palette/PaletteProvider' {
  import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'
  import Create from 'diagram-js/lib/features/create/Create'
  import SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool'
  import LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool'
  import HandTool from 'diagram-js/lib/features/hand-tool/HandTool'
  import GlobalConnect from 'diagram-js/lib/features/global-connect/GlobalConnect'
  import Palette from 'diagram-js/lib/features/palette/Palette'
  export default class PaletteProvider {
    constructor(
      palette: Palette,
      create: Create,
      elementFactory: ElementFactory,
      spaceTool: SpaceTool,
      lassoTool: LassoTool,
      handTool: HandTool,
      globalConnect: GlobalConnect,
      translate?: any,
      priority?: number
    )
  }
}
//
declare module 'bpmn-js/lib/features/popup-menu/ReplaceMenuProvider' {
  export default class ReplaceMenuProvider {}
}
//
declare module 'bpmn-js/lib/features/replace/BpmnReplace' {
  export default class BpmnReplace {}
}
//
declare module 'bpmn-js/lib/features/replace/ReplaceOptions' {
  export default class ReplaceOptions {}
}
//
declare module 'bpmn-js/lib/features/replace-preview/BpmnReplacePreview' {
  export default class BpmnReplacePreview {}
}
//
declare module 'bpmn-js/lib/features/rules/BpmnRules' {
  import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider'
  export default class BpmnRules extends RuleProvider {}
}
//
declare module 'bpmn-js/lib/features/search/BpmnSearchProvider' {
  export default class BpmnSearchProvider {}
}
//
declare module 'bpmn-js/lib/features/snapping/BpmnConnectSnapping' {
  export default class BpmnConnectSnapping {}
}
//
declare module 'bpmn-js/lib/features/snapping/BpmnCreateMoveSnapping' {
  export default class BpmnCreateMoveSnapping {}
}
