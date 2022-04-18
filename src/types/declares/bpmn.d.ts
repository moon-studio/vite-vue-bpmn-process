// interface ModelerOptions {
//   container: DOMElement // required - the DOM element that will contain the BPMN 2.0 diagram
//   width?: number | string // optional - the initial width for the diagram, default: '100%'
//   height?: number | string // optional - the initial height for the diagram, default: '100%'
//   additionalModules?: any[] // optional - additional modules to use, list of objects with properties name and init (see documentation in bpmn-js/lib/Modeler), 功能扩展模块
//   moddleExtensions?: any // optional - the moddle extensions to use, default: { camunda: camundaModdleDescriptor }, 定义模块
//   keyboard?: any // optional - the keyboard configuration to use, default: {}
// }
//
// declare class Diagram {
//   constructor(options: ModelerOptions)
//   attachTo(element: DOMElement): void // 重新挂载
//   clear(): void // 清空
//   destroy(): void // 销毁
//   detach(): void // 卸载
//   getDefinitions(): any // 获取定义json与
//   getModules(): any // 获取模块定义
//   importXML(xml: string): Promise<any> // 导入xml
//   off(event: string, listener: (event: any) => void): void // 移除事件
//   on(event: string, listener: (event: any) => void): void // 添加事件
//   open(xml: string): Promise<any> // 打开xml
//   saveXML(options?: any): Promise<any> // 保存xml
//   saveSVG(options?: any): Promise<any> // 保存svg
// }
//
// declare class Modeler extends Diagram {
//   get(name: string): any // 获取功能模块实例
//   createDiagram(xml: string): void // 创建流程图
// }
//
// declare module 'bpmn-js/lib/Modeler' {
//   export = Modeler
// }

/**
 * Typings for the bpmn-js project.
 *
 * @author Edoardo Luppi
 */
declare module 'bpmn-js' {
  import Modeling from 'bpmn-js/lib/features/modeling/Modeling'
  import Diagram from 'diagram-js'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import DefaultRenderer from 'diagram-js/lib/draw/DefaultRenderer'
  import translate from 'diagram-js/lib/i18n/translate/translate'
  import { ModdleElement, Root, ViewerOptions } from 'diagram-js/lib/model'
  import Moddle from 'moddle/lib/moddle'

  export default class Viewer extends Diagram {
    constructor(options?: ViewerOptions)

    get<T extends ServiceName | string>(service: T): Service<T>

    invoke(fn: (...v: any[]) => void | any[]): void

    importXML(xml: string): Promise<DoneCallbackOpt>

    open(diagram: BpmnDiDiagram | string): Promise<DoneCallbackOpt>

    saveXML(options: WriterOptions): Promise<DoneCallbackOpt>

    saveSVG(options: WriterOptions): Promise<DoneCallbackOpt>

    clear(): void

    destroy(): void

    on<T extends Event, P extends EventCallbackParams>(
      event: T,
      priority: number | Callback<P>,
      callback?: Callback<P>
    ): void

    /**
     * De-register an event listener.
     */
    off(events: Event | Event[], callback?: Callback<Event>): void

    attachTo<T extends Element>(parentNode: string | T): void

    detach(): void
  }

  export interface WriterOptions {
    format?: boolean
    preamble?: boolean
  }

  export interface DoneCallbackOpt {
    warn: any[]
    xml: string
    err?: any
  }

  /* Event types */
  export type GenericEvent = 'attach' | 'detach'
  export type DiagramEvent = 'diagram.init' | 'diagram.destroy' | 'diagram.clear'
  export type ImportEvent =
    | 'import.parse.start' // (about to read model from xml)
    | 'import.parse.complete' // (model read; may have worked or not)
    | 'import.render.start' // (graphical import start)
    | 'import.render.complete' // (graphical import finished)
    | 'import.done' // (everything done)
  export type SaveEvent =
    | 'saveXML.start' // (before serialization)
    | 'saveXML.serialized' // (after xml generation)
    | 'saveXML.done' // (everything done)
  export type SvgEvent =
    | 'saveSVG.start' // (before serialization)
    | 'saveSVG.done' // (everything done)
  export type ElementEvent =
    | 'element.changed'
    | 'element.hover'
    | 'element.out'
    | 'element.click'
    | 'element.dblclick'
    | 'element.mousedown'
    | 'element.mouseup'
  export type CommandStackPrefix = 'commandStack'
  export type CommandStackEvent = T extends CommandStackPrefix ? CommandStackPrefix : T

  export type Event =
    | GenericEvent
    | DiagramEvent
    | ElementEvent
    | ImportEvent
    | SaveEvent
    | SvgEvent
    | CommandStackEvent

  export type EventCallbackParams = {
    newSelection: Element[]
    element: Element
    gfx: SVGElement
    originalEvent: MouseEvent
    type?: string
  }

  export interface ElementObject {
    element: Root
    gfx: SVGElement
    originalEvent: Event
    type: ElementEvent
  }

  export type CallbackObject<T extends Event> = T extends ElementEvent | SaveEvent ? ElementObject : any

  export type ServiceName =
    | 'eventBus'
    | 'elementFactory'
    | 'elementRegistry'
    | 'canvas'
    | 'moddle'
    | 'modeling'
    | 'translate'
    | 'defaultRenderer'

  export type Service<T extends string> = ServiceMap extends Record<T, infer E> ? E : any

  interface ServiceMap {
    eventBus: EventBus
    elementRegistry: ElementRegistry
    elementFactory: ElementFactory
    canvas: Canvas
    moddle: Moddle
    modeling: Modeling
    defaultRenderer: DefaultRenderer
    translate: typeof translate
  }

  export type Callback<T extends Event> = (e: CallbackObject<T>) => void

  /////// BPMN ///////

  export enum BpmnRelationshipDirection {
    None = 'None',
    Forward = 'Forward',
    Backward = 'Backward',
    Both = 'Both'
  }

  export interface BpmnExtension {
    mustUnderstand: boolean
    definition?: BpmnExtensionDefinition
  }

  export interface BpmnImport {
    importType: string
    location?: string
    namespace: string
  }

  export interface BpmnExtensionDefinition {
    name: string
    extensionAttributeDefinitions?: BpmnExtensionAttributeDefinition[]
  }

  export interface BpmnExtensionAttributeDefinition {
    name: string
    type: string
    isReference?: boolean
  }

  export interface BpmnBaseElement extends ModdleElement {
    id: string
    documentation?: BpmnDocumentation
    extensionDefinitions?: BpmnExtensionDefinition[]
    extensionElements?: BpmnExtensionElements
  }

  export interface BpmnElement extends BpmnBaseElement {
    businessObject: any
  }

  export class BpmnExtensionElements extends ModdleElement {
    readonly $type: 'bpmn:ExtensionElements'
    values?: ModdleElement[]
    valueRef?: Element
    extensionAttributeDefinition?: BpmnExtensionAttributeDefinition
  }

  export class BpmnDocumentation extends BpmnBaseElement {
    readonly $type: 'bpmn:Documentation'
    text: string
    textFormat: string
  }

  export class BpmnStartEvent extends BpmnBaseElement {
    readonly $type: 'bpmn:StartEvent'
  }

  export class RootElement extends BpmnBaseElement {}

  export class BpmnRelationship extends BpmnBaseElement {
    readonly $type: 'bpmn:Relationship'
    type?: string
    direction?: BpmnRelationshipDirection
    source?: Element[]
    target?: Element[]
  }

  export interface BpmnInteractionNode {
    incomingConversationLinks: BpmnConversationLink[]
    outgoingConversationLinks: BpmnConversationLink[]
  }

  export class BpmnConversationLink extends BpmnBaseElement {
    sourceRef: BpmnInteractionNode
    targetRef: BpmnInteractionNode
    name: string
  }

  export interface BpmnParticipant extends BpmnBaseElement, BpmnInteractionNode {
    readonly $type: 'bpmn:Participant'
    type?: string
    name: string
    interfaceRef: any
    participantMultiplicity: any
    endPointRefs: any
    processRef: any
  }

  export class BpmnDefinitions extends BpmnBaseElement {
    readonly $type: 'bpmn:Definitions'
    name: string
    targetNamespace: string
    expressionLanguage?: string
    typeLanguage: string
    rootElements?: RootElement[]
    diagrams?: BpmnDiDiagram[]
    imports?: BpmnImport[]
    extensions?: BpmnExtension[]
    relationships?: BpmnRelationship[]
    exporter?: string
    exporterVersion?: string
  }

  /////// DI ///////

  export interface DiDiagram {
    id: string
    rootElement: DiDiagramElement
    name: string
    documentation: string
    resolution: number
    ownedStyle: DiStyle[]
  }

  export interface DiDiagramElement {
    id: string
    extension: DiExtension
    owningDiagram: DiDiagram
    owningElement: DiDiagramElement
    modelElement: Element
    style: DiStyle
    ownedElement: DiDiagramElement
  }

  export interface DiNode extends DiDiagramElement {}

  export interface DiPlane extends DiNode {
    planeElement: DiDiagramElement[]
  }

  export interface DiExtension {
    values: Element[]
  }

  export interface DiStyle {
    id: string
  }

  export interface DiEdge extends DiDiagramElement {
    source?: DiDiagramElement
    target?: DiDiagramElement
    waypoint?: DcPoint[]
  }

  export interface DiShape extends DiNode {
    bounds: DcBounds
  }

  export interface DiLabeledEdge extends DiEdge {
    ownedLabel?: DiLabel
  }

  export interface DiLabeledShape extends DiShape {
    ownedLabel?: DiLabel
  }

  export interface DiLabel extends DiNode {
    bounds: DcBounds
  }

  /////// BPMNDI ///////

  export interface BpmnDiDiagram extends DiDiagram, ModdleElement {
    $type: 'bpmndi:BPMNDiagram'
    plane: BpmnDiPlane
    labelStyle: BpmnDiLabelStyle[]
  }

  export interface BpmnDiEdge extends DiLabeledEdge, ModdleElement {
    $type: 'bpmndi:BPMNEdge'
    bpmnElement: BpmnBaseElement
  }

  export interface BpmnDiPlane extends DiPlane, ModdleElement {
    $type: 'bpmndi:BPMNPlane'
    bpmnElement: BpmnBaseElement
  }

  export interface BpmnDiShape extends DiLabeledShape, ModdleElement {
    $type: 'bpmndi:BPMNShape'
    bpmnElement: BpmnBaseElement
    isHorizontal?: boolean
    isExpanded?: boolean
    isMarkerVisible?: boolean
    label: BpmnDiLabel
    isMessageVisible?: boolean
    participantBandKind?: BpmnDiParticipantBandKind
    choreographyActivityShape: BpmnDiShape
  }

  export interface BpmnDiLabel extends DiLabel, ModdleElement {
    $type: 'bpmndi:BPMNLabel'
    labelStyle?: BpmnDiLabelStyle
  }

  export interface BpmnDiLabelStyle extends DiStyle {
    font: DcFont
  }

  export enum BpmnDiParticipantBandKind {
    TopInitiating = 'top_initiating',
    MiddleInitiating = 'middle_initiating',
    BottomInitiating = 'bottom_initiating',
    TopNonInitiating = 'top_non_initiating',
    MiddleNonInitiating = 'middle_non_initiating',
    BottomNonInitiating = 'bottom_non_initiating'
  }

  /////// DC ///////

  export interface DcBounds {
    x: number
    y: number
    width?: number
    height?: number
  }

  export interface DcFont {
    name?: string
    size?: number
    isBold?: boolean
    isItalic?: boolean
    isUnderline?: boolean
    isStrikeThrough?: boolean
  }

  export interface DcPoint {
    x: number
    y: number
  }
}

declare module 'bpmn-js/lib/Modeler' {
  import Viewer, { DoneCallbackOpt } from 'bpmn-js'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export default class Modeler extends Viewer {
    constructor(options?: ViewerOptions)

    /**
     * Create a new diagram to start modeling.
     */
    createDiagram(done: DoneCallbackOpt): void
  }
}

declare module 'bpmn-js/lib/util/LabelUtil' {
  import { Base } from 'diagram-js/lib/model'
  import { BpmnElement } from 'moddle/lib/moddle'

  export function isLabelExternal(element: Base): boolean
  export function hasExternalLabel(element: Base): boolean
  export function getExternalLabelMid(element: Base): { x: number; y: number }
  export function getExternalLabelBounds(semantic: BpmnElement, element: Base): Bounds
  export function isLabel(element?: Base): boolean

  export interface Bounds {
    x: number
    y: number
    width?: number
    height?: number
  }
}

declare module 'bpmn-js/lib/util/ModelUtil' {
  import { Base, ModdleElement } from 'diagram-js/lib/model'
  import { BpmnElement, BpmnElementType } from 'moddle/lib/moddle'

  /**
   * Is an element of the given BPMN type?
   */
  export function is<T extends BpmnElementType | string>(element: ModdleElement, type: T): element is BpmnElement<T>
  export function is<T extends BpmnElementType | string>(
    element: Base,
    type: T
  ): element is Base & { businessObject: BpmnElement<T> }

  /**
   * Return the business object for a given element.
   */
  export function getBusinessObject(element: Base | ModdleElement): ModdleElement
}

declare module 'bpmn-js/lib/draw/BpmnRenderer' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
  import { Base, Connection, ModdleElement, Shape } from 'diagram-js/lib/model'

  export default class BpmnRenderer extends BaseRenderer {
    constructor(
      config: any /* RendererOptions | null */,
      eventBus: EventBus,
      styles: any /* Styles */,
      pathMap: any,
      canvas: Canvas,
      textRenderer: any,
      rendererPriority?: number
    )

    canRender(element: Base | ModdleElement): boolean
    drawShape(parentGfx: SVGElement, element: Shape): SVGElement
    drawConnection(parentGfx: SVGElement, element: Connection): SVGGraphicsElement
    getShapePath(element: Shape): string
  }
}

declare module 'bpmn-js/lib/draw/TextRenderer' {
  import { Bounds } from 'diagram-js/lib/features/rules/RuleProvider'

  export default class TextRenderer {
    constructor(config: any)

    getExternalLabelBounds(bounds: Bounds, text: string): Bounds
    getTextAnnotationBounds(bounds: Bounds, text: string): Bounds
    createText(text: string, options?: any): SVGElement
    getDefaultStyle(): TextStyle
    getExternalStyle(): TextStyle
  }

  export interface TextStyle {
    fontFamily: string
    fontSize: number
    fontWeight: string
    lineHeight?: number
    [k: string]: any
  }
}

declare module 'bpmn-js/lib/draw/PathMap' {
  export default class PathMap {
    pathMap: { [id: string]: PathElement }
    getRawPath(pathId: string): string
    getScaledPath(pathId: string, param: ScaleParams): string
  }

  export interface PathElement {
    d: string
    height?: number
    width?: number
    heightElements?: number[]
    widthElements?: number[]
  }

  export interface ScaleParams {
    xScaleFactor?: number
    yScaleFactor?: number
    containerWidth?: number
    containerHeight?: number
    position?: {
      mx?: number
      my?: number
    }
  }
}

declare module 'bpmn-js/lib/features/modeling/util/ModelingUtil' {
  import { Base, ModdleElement } from 'diagram-js/lib/model'

  function isAny(element: Base, types: string[]): boolean

  function getParent(element: Base, anyType: string | string[]): ModdleElement
}

declare module 'bpmn-js/lib/features/modeling/Modeling' {
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Base } from 'diagram-js/lib/model'

  export default class Modeling {
    constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: any, bpmnRules: any)

    setColor(elements: Base[] /* KV */, colors?: Colors): void
    updateProperties(element: Base, properties: any): void
  }

  export interface Colors {
    fill?: string
    stroke?: string
  }
}

declare module 'bpmn-js/lib/features/modeling/BpmnFactory' {
  import { BpmnBaseElement, BpmnDiEdge, BpmnDiLabel, BpmnDiPlane, BpmnDiShape, DcBounds, DcPoint } from 'bpmn-js'
  import { Attributes } from 'diagram-js/lib/core/ElementFactory'
  import { ModdleElement } from 'diagram-js/lib/model'

  export default class BpmnFactory {
    constructor(moddle: any)

    create(type: string | object, attrs: Attributes): ModdleElement
    createDiLabel(): BpmnDiLabel
    createDiShape(semantic: BpmnBaseElement, bounds: object, attrs: Attributes): BpmnDiShape

    createDiBounds(bounds: object): DcBounds
    createDiWaypoints(waypoints: DcPoint[]): DcPoint[]
    createDiWaypoint(point: DcPoint): DcPoint
    createDiEdge(semantic: BpmnBaseElement, waypoints: DcPoint[], attrs: Attributes): BpmnDiEdge
    createDiPlane(semantic: BpmnBaseElement): BpmnDiPlane
  }
}

declare module 'bpmn-js/lib/features/palette/PaletteProvider' {
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import Create from 'diagram-js/lib/features/create/Create'
  import GlobalConnect from 'diagram-js/lib/features/global-connect/GlobalConnect'
  import HandTool from 'diagram-js/lib/features/hand-tool/HandTool'
  import LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool'
  import Palette, { PaletteEntryDescriptor } from 'diagram-js/lib/features/palette/Palette'
  import SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool'
  import { TranslateFn } from 'diagram-js/lib/i18n/translate/translate'

  export default class PaletteProvider {
    constructor(
      palette: Palette,
      create: Create,
      elementFactory: ElementFactory,
      spaceTool: SpaceTool,
      lassoTool: LassoTool,
      handTool: HandTool,
      globalConnect: GlobalConnect,
      translate: TranslateFn
    )

    getPaletteEntries(element: any): { [id: string]: PaletteEntryDescriptor }
  }
}

declare module 'bpmn-js/lib/features/context-pad/ContextPadProvider' {
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import { ContextPadEntryDescriptor } from 'diagram-js/lib/features/context-pad/ContextPad'
  import Create from 'diagram-js/lib/features/create/Create'
  import GlobalConnect from 'diagram-js/lib/features/global-connect/GlobalConnect'
  import HandTool from 'diagram-js/lib/features/hand-tool/HandTool'
  import LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool'
  import Palette from 'diagram-js/lib/features/palette/Palette'
  import SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool'
  import { TranslateFn } from 'diagram-js/lib/i18n/translate/translate'

  export default class ContextPadProvider {
    constructor(
      palette: Palette,
      create: Create,
      elementFactory: ElementFactory,
      spaceTool: SpaceTool,
      lassoTool: LassoTool,
      handTool: HandTool,
      globalConnect: GlobalConnect,
      translate: TranslateFn
    )

    getContextPadEntries(element: any): { [id: string]: ContextPadEntryDescriptor }
  }
}

/// Snapping

declare module 'bpmn-js/lib/features/snapping' {
  import { DJSModule } from 'diagram-js'

  const snappingModule: DJSModule
  export default snappingModule
}

declare module 'bpmn-js/lib/features/label-editing/LabelUtil' {
  import { Base } from 'diagram-js/lib/model'

  export function getLabel(element: Base): string
  export function setLabel(element: Base, text: string, isExternal?: boolean): Base
}
