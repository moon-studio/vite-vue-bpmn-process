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
//
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
//
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
//
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
//
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
//
declare module 'bpmn-js/lib/import/BpmnTreeWalker' {
  import { Translate } from 'diagram-js/lib/i18n/translate'

  export default class BpmnTreeWalker {
    constructor(handler, translate: Translate)
  }
}
/************************************* feature 扩展功能 *************************************/
declare module 'bpmn-js/lib/features/modeling/Modeling.js' {
  import BaseModeling from 'diagram-js/lib/features/modeling/Modeling'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import CommandStack from 'diagram-js/lib/command/CommandStack'
  import { Connection, Hints, Shape } from 'diagram-js/lib/model'

  export default class Modeling extends BaseModeling {
    constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: CommandStack, bpmnRules: any)
    getHandlers(): any
    updateLabel(element: any, newLabel: any, newBounds, hints): void
    connect(source: Shape, target: Shape, attrs?: Object, hints?: Hints): Connection
  }
}
//
declare module 'bpmn-js/lib/features/modeling/BpmnFactory' {
  import { Moddle } from 'moddle'
  import { Base } from 'diagram-js/lib/model'
  import { ModdleElement } from 'diagram-js/lib/model'

  export default class BpmnFactory {
    constructor(moddle: Moddle)
    private _needsId<E extends Base>(element: E): boolean
    private _ensureId<E extends Base>(element: E): void
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
//
declare module 'bpmn-js/lib/features/modeling/ElementFactory' {
  import DiagramElementFactory from 'diagram-js/lib/core/ElementFactory'
  import { Moddle } from 'moddle'
  import { Translate } from 'diagram-js/lib/i18n/translate'
  import BpmnFactory from 'bpmn-js/lib/features/modeling/BpmnFactory.js'
  import { Base, Connection, Label, ModdleElement, Root, Shape } from 'diagram-js/lib/model'
  import { Dimensions } from 'diagram-js/lib/core/Canvas'

  export default class ElementFactory extends DiagramElementFactory {
    constructor(bpmnFactory: BpmnFactory, moddle: Moddle, translate: Translate)
    baseCreate(type: string, attrs: any): Root | Shape | Connection | Label
    create<E extends Base>(elementType: string, attrs?: Object): E & ModdleElement
    createBpmnElement<E extends Base>(elementType: string, attrs?: Object): E & ModdleElement
    getDefaultSize(element, di): Dimensions
    createParticipantShape(attrs?: Object): Shape & ModdleElement
  }
}

//
declare module 'bpmn-js/lib/features/auto-place/BpmnAutoPlace' {
  export default class BpmnAutoPlace {}
}
//
declare module 'bpmn-js/lib/features/auto-resize/BpmnAutoResize' {
  export default class BpmnAutoResize {}
}
//
declare module 'bpmn-js/lib/features/auto-resize/BpmnAutoResizeProvider' {
  export default class BpmnAutoResizeProvider {}
}
//
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
  }
}
//
declare module 'bpmn-js/lib/features/copy-paste/BpmnCopyPaste' {
  export default class BpmnCopyPaste {}
}
//
declare module 'bpmn-js/lib/features/copy-paste/ModdleCopy' {
  export default class ModdleCopy {}
}
//
declare module 'bpmn-js/lib/features/di-ordering/BpmnDiOrdering' {
  export default class BpmnDiOrdering {}
}
//
declare module 'bpmn-js/lib/features/distribute-elements/BpmnDistributeElements' {
  export default class BpmnDistributeElements {}
}
//
declare module 'bpmn-js/lib/features/drilldown/DrilldownBreadcrumbs' {
  export default class DrilldownBreadcrumbs {}
}
//
declare module 'bpmn-js/lib/features/drilldown/DrilldownCentering' {
  export default class DrilldownCentering {}
}
//
declare module 'bpmn-js/lib/features/drilldown/DrilldownOverlayBehavior' {
  export default class DrilldownOverlayBehavior {}
}
//
declare module 'bpmn-js/lib/features/drilldown/SubprocessCompatibility' {
  export default class SubprocessCompatibility {}
}
//
declare module 'bpmn-js/lib/features/editor-actions/BpmnEditorActions' {
  export default class BpmnEditorActions {}
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
  export default class BpmnRules {}
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
