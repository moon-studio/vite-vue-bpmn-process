declare module 'diagram-js' {
  import { Service, ServiceName } from 'bpmn-js'
  import { ViewerOptions } from 'diagram-js/lib/model'

  export interface DJSModule {
    __depends__?: DJSModule[]
    __init__?: any[]
    [id: string]: undefined | any[] | DJSModule[] | ['type' | 'factory' | 'value', any]
  }

  export default class Diagram {
    constructor(options?: ViewerOptions, injector?: any)

    get<T extends ServiceName | string>(service: T): Service<T>

    invoke(fn: (...v: any[]) => void | any[]): void

    /**
     * Destroys the diagram.
     */
    destroy(): void

    /**
     * Clear the diagram, removing all contents.
     */
    clear(): void
  }
}

/// Models

declare module 'diagram-js/lib/model' {
  import { DJSModule } from 'diagram-js'
  import { KeyboardConfig } from 'diagram-js/lib/features/keyboard/Keyboard'
  import { KeyboardMoveConfig } from 'diagram-js/lib/navigation/keyboard-move/KeyboardMove'
  import { Descriptor } from 'moddle/lib/descriptor-builder'
  import Moddle from 'moddle/lib/moddle'

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
    $model: Moddle
    $descriptor: Descriptor
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

    /**
     * The actual element that gets imported from BPMN 2.0 XML
     * and serialized during export.
     */
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

  export interface ViewerOptions {
    keyboard?: KeyboardConfig
    keyboardMove?: KeyboardMoveConfig
    container?: string | HTMLDivElement | Element
    width?: string | number
    height?: string | number
    position?: string
    deferUpdate?: boolean
    modules?: DJSModule[]
    additionalModules?: any[]
    moddleExtensions?: { [id: string]: any }
    propertiesPanel?: {
      parent: string | HTMLDivElement | Element
    }

    [field: string]: any
  }
}

/// EventBus

declare module 'diagram-js/lib/core/EventBus' {
  import { Shape } from 'diagram-js/lib/model'
  export default class EventBus {
    /**
     * Register an event listener for events with the given name.
     *
     * The callback will be invoked with `event, ...additionalArguments`
     * that have been passed to {@link EventBus#fire}.
     *
     * Returning false from a listener will prevent the events default action
     * (if any is specified). To stop an event from being processed further in
     * other listeners execute {@link InternalEvent#stopPropagation}.
     *
     * Returning anything but `undefined` from a listener will stop the listener
     * propagation.
     *
     * @param events The events to listen to
     * @param priority The priority in which this listener is called, larger is higher
     */
    on<T extends string>(event: T, priority: number, callback: EventCallback<T>, that?: any): void
    on<T extends string>(event: T, callback: EventCallback<T>, that?: any): void
    on(events: string[], priority: number, callback: EventCallback, that?: any): void
    on(events: string[], callback: EventCallback, that?: any): void

    /**
     * Register an event listener that is executed only once.
     *
     * @param event The event to listen to
     * @param priority The priority in which this listener is called, larger is higher
     */
    once<T extends string>(event: T, priority: number, callback: EventCallback<T>): void
    once<T extends string>(event: T, callback: EventCallback<T>): void

    /**
     * Removes event listeners by event and callback.
     *
     * If no callback is given, all listeners for a given event name are being removed.
     */
    off(events: string | string[], callback?: EventCallback): void

    /**
     * Create an EventBus event.
     */
    createEvent(data?: any): InternalEvent

    /**
     * Fires a named event.
     *
     * @example
     *
     * // fire event by name
     * events.fire('foo');
     *
     * // fire event object with nested type
     * var event = { type: 'foo' };
     * events.fire(event);
     *
     * // fire event with explicit type
     * var event = { x: 10, y: 20 };
     * events.fire('element.moved', event);
     *
     * // pass additional arguments to the event
     * events.on('foo', function(event, bar) {
     *   alert(bar);
     * });
     *
     * events.fire({ type: 'foo' }, 'I am bar!');
     *
     * @param name The event name
     * @param event The event object
     * @param data Additional arguments to be passed to the callback functions
     *
     * @return the events return value, if specified or false if the
     *         default action was prevented by listeners
     */
    fire(name: string | { type: string }, event: any, ...data: any[]): any

    handleError(error: any): boolean
  }

  export type EventCallback<T extends string = any> = (event: EventType<T>, data: any) => any

  export type EventType<T extends string> = EventMap extends Record<T, infer E> ? E : InternalEvent

  interface EventMap {
    'selection.changed': SelectionChangedEvent
    'element.click': ElementClickEvent
  }

  export interface InternalEvent {
    cancelBubble?: boolean
    defaultPrevented?: boolean
    [field: string]: any

    init(data: any): void
    stopPropagation(): void
    preventDefault(): void
  }

  export interface SelectionChangedEvent extends InternalEvent {
    readonly type: 'selection.changed'
    newSelection: Shape[]
    oldSelection: Shape[]
  }

  export interface ElementClickEvent extends InternalEvent {
    readonly type: 'element.click'
    element: Shape
    gfx: SVGElement
    originalEvent: MouseEvent
  }
}

declare module 'diagram-js/lib/features/rules/Rules' {
  import { Injector } from 'didi'

  export default class Rules {
    constructor(injector: Injector)

    allowed(action: string, context: any): boolean
  }
}

/// RuleProvider

declare module 'diagram-js/lib/features/rules/RuleProvider' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Shape } from 'diagram-js/lib/model'

  export default abstract class RuleProvider {
    protected constructor(eventBus: EventBus)

    addRule<T extends string>(action: T, ruleFn: RuleFn<T>): void
    addRule<T extends string>(action: T, priority: number, ruleFn: RuleFn<T>): void
    addRule(actions: string[], ruleFn: RuleFn): void
    addRule(actions: string[], priority: number, ruleFn: RuleFn): void

    abstract init(): void
  }

  type RuleFn<T extends string = any> = (context: RuleContext<T>) => boolean | undefined
  type RuleContext<T extends string> = RuleContextMap extends Record<T, infer E> ? E : any

  interface RuleContextMap {
    'shape.resize': ShapeResizeContext
    'elements.move': ElementsMoveContext
  }

  interface Delta {
    x: number
    y: number
  }

  export interface Bounds {
    height?: number
    width?: number
    x?: number
    y?: number
  }

  interface Context {
    shape: Shape
    canExecute?: boolean
    delta?: Delta
    direction?: 'nw' | 'ne' | 'se' | 'sw'
    frame?: SVGRectElement
    minDimensions?: {
      width: number
      height: number
    }
    newBounds?: Bounds
    resizeConstraints?: {
      min: {
        bottom: number
        left: number
        right: number
        top: number
      }
    }
  }

  // prettier-ignore
  export type ShapeResizeContext =
    Pick<Context, 'newBounds' | 'shape' | 'delta' | 'direction'>;

  export interface ElementsMoveContext {
    shapes: Shape[]
    delta?: Delta
    position?: Delta
    target?: Shape // Doubt: Root?
  }
}

/// BaseRenderer

declare module 'diagram-js/lib/draw/BaseRenderer' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Base, Connection, ModdleElement, Shape } from 'diagram-js/lib/model'

  export default abstract class BaseRenderer {
    protected constructor(eventBus: EventBus, rendererPriority?: number)

    abstract canRender(element: Base | ModdleElement): boolean
    drawShape(parentGfx: SVGElement, element: Shape): SVGElement
    drawConnection(parentGfx: SVGElement, element: Connection): SVGGraphicsElement
    getShapePath(element: Shape): string
    getConnectionPath(element: Connection): string
  }
}

/// DefaultRenderer

declare module 'diagram-js/lib/draw/DefaultRenderer' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
  import Styles from 'diagram-js/lib/draw/Styles'
  import { Base, ModdleElement } from 'diagram-js/lib/model'

  export default class DefaultRenderer extends BaseRenderer {
    // noinspection LocalVariableNamingConventionJS
    CONNECTION_STYLE: Style
    // noinspection LocalVariableNamingConventionJS
    SHAPE_STYLE: Style
    // noinspection LocalVariableNamingConventionJS
    FRAME_STYLE: Style

    constructor(eventBus: EventBus, styles: Styles)

    canRender(element: Base | ModdleElement): boolean
  }

  export interface Style {
    fill?: string
    fillOpacity?: number
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: number
    strokeOpacity?: number
    pointerEvents?: string
    class?: string
    [id: string]: any
  }
}

/// Styles

declare module 'diagram-js/lib/draw/Styles' {
  export default class Styles {
    cls(className: any, traits: any, additionalAttrs: any): any
    style(traits: any, additionalTraits: any): any
    computeStyle(custom: any, additionalTraits: any): any
    computeStyle(custom: any, traits: any[], additionalTraits: any): any
  }
}

/// ElementRegistry

declare module 'diagram-js/lib/core/ElementRegistry' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Base } from 'diagram-js/lib/model'

  export default class ElementRegistry {
    constructor(eventBus: EventBus)

    /**
     * Register a pair of (element, gfx, (secondaryGfx)).
     */
    add(element: Base, gfx: SVGElement, secondaryGfx?: SVGElement): void

    /**
     * Removes an element from the registry.
     */
    remove(element: string | Base): void

    /**
     * Update the id of an element
     */
    updateId(element: string | Base, newId: string): void

    /**
     * Return the model element for a given id or graphics.
     *
     * @example
     * elementRegistry.get('SomeElementId_1');
     * elementRegistry.get(gfx);
     *
     * @param filter The filter for selecting the element
     */
    get(filter: string | SVGElement): Base

    /**
     * Return all elements that match a given filter function.
     */
    filter(fn: (element: Base, gfx: SVGElement) => boolean): Base[]

    /**
     * Return all rendered model elements.
     */
    getAll(): Base[]

    /**
     * Iterate over all diagram elements.
     */
    forEach(fn: (element: Base, gfx: SVGElement) => any): void

    /**
     * Return the graphical representation of an element or its id.
     *
     * @example
     * elementRegistry.getGraphics('SomeElementId_1');
     * elementRegistry.getGraphics(rootElement); // <g ...>
     *
     * elementRegistry.getGraphics(rootElement, true); // <svg ...>
     *
     *
     * @param filter The filter to use
     * @param secondary Whether to return the secondary connected element
     */
    getGraphics(filter: string | Base, secondary?: boolean): SVGElement
  }
}

/// ElementFactory

declare module 'diagram-js/lib/core/ElementFactory' {
  import { Base, Connection, Label, Point, Root, Shape } from 'diagram-js/lib/model'

  /**
   * A factory for diagram-js shapes.
   */
  export default class ElementFactory {
    createRoot(attrs?: Attributes): Root
    createLabel(attrs?: Attributes): Label
    createShape(attrs?: Attributes): Shape
    createConnection(attrs?: Attributes): Connection
    create(type: string, attrs?: Attributes): Base
  }

  export interface Attributes {
    id?: string
    x?: number
    y?: number
    width?: number
    height?: number
    isFrame?: boolean
    collapsed?: boolean
    hidden?: boolean
    resizable?: boolean | 'maybe' | 'always'
    ignoreResize?: boolean
    waypoints?: Point[]
    source?: Shape
    target?: Shape
    host?: Shape
    alwaysTopLevel?: boolean
    level?: number
    labelTarget?: Base
  }
}

/// Canvas

declare module 'diagram-js/lib/core/Canvas' {
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'
  import { Base, ModdleElement, Point, ViewerOptions } from 'diagram-js/lib/model'

  export default class Canvas {
    constructor(
      config: ViewerOptions | null,
      eventBus: EventBus,
      graphicsFactory: GraphicsFactory,
      elementRegistry: ElementRegistry
    )

    addMarker(element: string | Base | ModdleElement, marker: string): void
    removeMarker(element: string | Base, marker: string): void
    hasMarker(element: string | Base, marker: string): void
    toggleMarker(element: string | Base, marker: string): void
    getSize(): { width: number; height: null }
    getAbsoluteBBox(element: any): {
      x: number
      y: number
      width: number
      height: number
    }
    resized(): void
    zoom(newScale?: string, center?: Point): number
    getDefaultLayer(): SVGElement
    getLayer(name: string, index?: number): SVGElement
  }
}

/// GraphicsFactory

declare module 'diagram-js/lib/core/GraphicsFactory' {
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class GraphicsFactory {
    constructor(eventBus: EventBus, elementRegistry: ElementRegistry)
  }
}

/// Translate

declare module 'diagram-js/lib/i18n/translate' {
  import t from 'diagram-js/lib/i18n/translate/translate'

  const exp: {
    translate: ['value', typeof t]
  }

  export default exp
}

declare module 'diagram-js/lib/i18n/translate/translate' {
  export type TranslateFn = (template: string, replacements?: { [id: string]: string }) => string

  // noinspection JSFunctionExpressionToArrowFunction
  export default function translate(template: string, replacements?: { [id: string]: string }): string
}

/// Palette

declare module 'diagram-js/lib/features/palette' {
  import { DJSModule } from 'diagram-js'

  const paletteModule: DJSModule
  export default paletteModule
}

declare module 'diagram-js/lib/features/palette/Palette' {
  import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class Palette {
    constructor(eventBus: EventBus, canvas: Canvas)

    registerProvider(provider: PaletteProvider): void
    registerProvider(priority: number, provider: PaletteProvider): void
    getEntries(): { [key: string]: PaletteEntryDescriptor }
    trigger(action: string, event: Event, autoActivate: boolean): void
    close(): void
    open(): void
    toggle(): void
    isActiveTool(tool: any): boolean
    updateToolHighlight(name: string): void
    isOpen(): boolean
  }

  export interface PaletteEntryDescriptor {
    group: any
    className?: string
    title?: string
    separator?: boolean
    action?: {
      dragstart?: (event: Event) => void
      click?: (event: Event) => void
    }
  }
}

/// ContextPad

declare module 'diagram-js/lib/features/context-pad' {
  import { DJSModule } from 'diagram-js'

  const contextPadModule: DJSModule
  export default contextPadModule
}

declare module 'diagram-js/lib/features/context-pad/ContextPad' {
  import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider'
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class ContextPad {
    constructor(config: any, eventBus: EventBus, overlays: any)

    registerProvider(provider: ContextPadProvider): void
    registerProvider(priority: number, provider: ContextPadProvider): void
    getEntries(element: any): { [key: string]: ContextPadEntryDescriptor }
    trigger(action: string, event: Event, autoActivate: boolean): void
    close(): void
    open(element: any, force?: boolean): void
    isOpen(element: any): boolean
  }

  export interface ContextPadEntryDescriptor {
    group: any
    className?: string
    title?: string
    separator?: boolean
    action?: {
      dragstart?: (event: Event, element?: any, autoActivate?: boolean) => void
      click?: (event: Event, element?: any, autoActivate?: boolean) => void
    }
  }
}

/// Create

declare module 'diagram-js/lib/features/create' {
  import { DJSModule } from 'diagram-js'

  const createModule: DJSModule
  export default createModule
}

declare module 'diagram-js/lib/features/create/Create' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'

  export default class Create {
    constructor(canvas: Canvas, dragging: Dragging, eventBus: EventBus, modeling: Modeling, rules: any)

    start(event: Event | undefined, elements: any, context?: any): void
  }
}

/// Dragging

declare module 'diagram-js/lib/features/dragging' {
  import { DJSModule } from 'diagram-js'

  const draggingModule: DJSModule
  export default draggingModule
}

declare module 'diagram-js/lib/features/dragging/Dragging' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import { Point } from 'diagram-js/lib/model'

  export default class Dragging {
    constructor(eventBus: EventBus, canvas: Canvas, selection: Selection, elementRegistry: ElementRegistry)

    init(event?: MouseEvent | TouchEvent, relativeTo?: Point | string, prefix?: string, options?: any): void
  }
}

/// SpaceTool

declare module 'diagram-js/lib/features/space-tool' {
  import { DJSModule } from 'diagram-js'

  const spaceToolModule: DJSModule
  export default spaceToolModule
}

declare module 'diagram-js/lib/features/space-tool/SpaceTool' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import ToolManager from 'diagram-js/lib/features/tool-manager/ToolManager'

  export default class SpaceTool {
    // noinspection OverlyComplexFunctionJS
    constructor(
      eventBus: EventBus,
      dragging: Dragging,
      canvas: Canvas,
      modeling: Modeling,
      rules: any,
      toolManager: ToolManager
    )
  }
}

/// Modeling

declare module 'diagram-js/lib/features/modeling' {
  import { DJSModule } from 'diagram-js'

  const modelingModule: DJSModule
  export default modelingModule
}

declare module 'diagram-js/lib/features/modeling/Modeling' {
  import { Bounds } from 'diagram-js-direct-editing'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Base, Point } from 'diagram-js/lib/model'

  export default class Modeling {
    constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: any)

    removeElements(elements: any): void
    removeShape(label: any, hints: any): void
    createLabel(labelTarget: any, position: Point, label: any, parent?: any): Base
    resizeShape(label: any, newBounds: Bounds, minBounds: Bounds, hints?: any): void
  }
}

/// LassoTool

declare module 'diagram-js/lib/features/lasso-tool' {
  import { DJSModule } from 'diagram-js'

  const lassoToolModule: DJSModule
  export default lassoToolModule
}

declare module 'diagram-js/lib/features/lasso-tool/LassoTool' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import Selection from 'diagram-js/lib/features/selection/Selection'
  import ToolManager from 'diagram-js/lib/features/tool-manager/ToolManager'

  export default class LassoTool {
    // noinspection OverlyComplexFunctionJS
    constructor(
      eventBus: EventBus,
      canvas: Canvas,
      dragging: Dragging,
      elementRegistry: ElementRegistry,
      selection: Selection,
      toolManager: ToolManager
    )

    activateSelection(event: Event): void
  }
}

/// Selection

declare module 'diagram-js/lib/features/selection' {
  import { DJSModule } from 'diagram-js'

  const selectionModule: DJSModule
  export default selectionModule
}

declare module 'diagram-js/lib/features/selection/Selection' {
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class Selection {
    constructor(eventBus: EventBus)
  }
}

/// ToolManager

declare module 'diagram-js/lib/features/tool-manager' {
  import { DJSModule } from 'diagram-js'

  const toolManagerModule: DJSModule
  export default toolManagerModule
}

declare module 'diagram-js/lib/features/tool-manager/ToolManager' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'

  export default class ToolManager {
    constructor(eventBus: EventBus, dragging: Dragging)
  }
}

/// HandTool

declare module 'diagram-js/lib/features/hand-tool' {
  import { DJSModule } from 'diagram-js'

  const handToolModule: DJSModule
  export default handToolModule
}

declare module 'diagram-js/lib/features/hand-tool/HandTool' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import ToolManager from 'diagram-js/lib/features/tool-manager/ToolManager'
  import { Injector } from 'didi'

  export default class HandTool {
    constructor(eventBus: EventBus, canvas: Canvas, dragging: Dragging, injector: Injector, toolManager: ToolManager)
  }
}

/// GlobalConnect

declare module 'diagram-js/lib/features/global-connect' {
  import { DJSModule } from 'diagram-js'

  const globalConnectModule: DJSModule
  export default globalConnectModule
}

declare module 'diagram-js/lib/features/global-connect/GlobalConnect' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Connect from 'diagram-js/lib/features/connect/Connect'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import ToolManager from 'diagram-js/lib/features/tool-manager/ToolManager'

  export default class GlobalConnect {
    // noinspection OverlyComplexFunctionJS
    constructor(
      eventBus: EventBus,
      dragging: Dragging,
      connect: Connect,
      canvas: Canvas,
      toolManager: ToolManager,
      rules: any
    )
  }
}

/// Connect

declare module 'diagram-js/lib/features/connect' {
  import { DJSModule } from 'diagram-js'

  const connectModule: DJSModule
  export default connectModule
}

declare module 'diagram-js/lib/features/connect/Connect' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Dragging from 'diagram-js/lib/features/dragging/Dragging'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'

  export default class Connect {
    constructor(eventBus: EventBus, dragging: Dragging, modeling: Modeling, rules: any)

    start(event: Event, start: any, autoActivate?: boolean): void
    start(event: Event, start: any, connectionStart: any, autoActivate: boolean): void
  }
}

// Text
declare module 'diagram-js/lib/util/Text' {
  export default class Text {
    constructor(config?: TextConfig)

    createText(text: string, options: Options): SVGElement
    getDimensions(text: string, options: Options): Dimensions
    layoutText(): Layout
  }

  export interface Options {
    box?: {
      x: number
      y: number
      width?: number
      height?: number
    }
    fitBox?: boolean
    padding?: number
    style?: any
    align?: string
  }

  export interface TextConfig {
    size?: number
    padding?: number
    style?: any
    align?: string
  }

  export interface Layout {
    dimensions: Dimensions
    element: Element
  }

  export interface Dimensions {
    width: number
    height: number
  }
}

/// SvgTransformUtil

declare module 'diagram-js/lib/util/SvgTransformUtil' {
  export function transform(gfx: SVGElement, x: number, y: number, angle?: number, amount?: number): void
  export function translate(gfx: SVGElement, x: number, y: number): void
  export function rotate(gfx: SVGElement, angle: number): void
  export function scale(gfx: SVGElement, amount: number): void
}

/// Elements

declare module 'diagram-js/lib/util/Elements' {
  export function getParents(elements: any): any

  export function isFrameElement(element: any): boolean
}

/// Move

declare module 'diagram-js/lib/features/move' {
  import { DJSModule } from 'diagram-js'

  const moveModule: DJSModule
  export default moveModule
}

/// Outline

declare module 'diagram-js/lib/features/outline' {
  import { DJSModule } from 'diagram-js'

  const outlineModule: DJSModule
  export default outlineModule
}

/// Resize

declare module 'diagram-js/lib/features/resize' {
  import { DJSModule } from 'diagram-js'

  const resizeModule: DJSModule
  export default resizeModule
}

/// Rules

declare module 'diagram-js/lib/features/rules' {
  import { DJSModule } from 'diagram-js'

  const rulesModule: DJSModule
  export default rulesModule
}

/// ConnectionPreview

declare module 'diagram-js/lib/features/connection-preview' {
  import { DJSModule } from 'diagram-js'

  const connectionPreviewModule: DJSModule
  export default connectionPreviewModule
}

/// Bendpoints

declare module 'diagram-js/lib/features/bendpoints' {
  import { DJSModule } from 'diagram-js'

  const bendpointsModule: DJSModule
  export default bendpointsModule
}

/// GridSnapping

declare module 'diagram-js/lib/features/grid-snapping' {
  import { DJSModule } from 'diagram-js'

  const gridSnappingModule: DJSModule
  export default gridSnappingModule
}

/// Snapping

declare module 'diagram-js/lib/features/snapping' {
  import { DJSModule } from 'diagram-js'

  const snappingModule: DJSModule
  export default snappingModule
}

/// ChangeSupport

declare module 'diagram-js/lib/features/change-support' {
  import { DJSModule } from 'diagram-js'

  const changeSupportModule: DJSModule
  export default changeSupportModule
}

/// EditorActions

declare module 'diagram-js/lib/features/editor-actions' {
  import { DJSModule } from 'diagram-js'

  const editorActionsModule: DJSModule
  export default editorActionsModule
}

declare module 'diagram-js/lib/features/editor-actions/EditorActions' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Injector } from 'didi'

  export default class EditorActions {
    constructor(eventBus: EventBus, injector: Injector)

    trigger(action: string, opts: any): any
    register(actions: string, listener: (opts: any) => void): void
    register(actions: any): void // TODO
    unregister(action: string): void
    getActions(): string[]
    isRegistered(action: string): boolean
  }
}

/// Keyboard

declare module 'diagram-js/lib/features/keyboard' {
  import { DJSModule } from 'diagram-js'

  const keyboardModule: DJSModule
  export default keyboardModule
}

declare module 'diagram-js/lib/features/keyboard/Keyboard' {
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class Keyboard {
    constructor(config: KeyboardConfig, eventBus: EventBus)

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

/// KeyboardBindings

declare module 'diagram-js/lib/features/keyboard/KeyboardBindings' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import EditorActions from 'diagram-js/lib/features/editor-actions/EditorActions'
  import Keyboard from 'diagram-js/lib/features/keyboard/Keyboard'

  export default class KeyboardBindings {
    constructor(eventBus: EventBus, keyboard: Keyboard)

    registerBindings(keyboard: Keyboard, editorActions: EditorActions): void
  }
}

/// Mouse

declare module 'diagram-js/lib/features/mouse' {
  import { DJSModule } from 'diagram-js'

  const mouseModule: DJSModule
  export default mouseModule
}

declare module 'diagram-js/lib/features/mouse/Mouse' {
  import EventBus from 'diagram-js/lib/core/EventBus'

  export default class Mouse {
    constructor(eventBus: EventBus)

    getLastMoveEvent(): MouseEvent
  }

  export function createMoveEvent(x: number, y: number): MouseEvent
}

/// Clipboard

declare module 'diagram-js/lib/features/clipboard' {
  import { DJSModule } from 'diagram-js'

  const clipboardModule: DJSModule
  export default clipboardModule
}

declare module 'diagram-js/lib/features/clipboard/Clipboard' {
  export default class Clipboard {
    get(): any
    set(data: any): void
    clear(): any
    isEmpty(): boolean
  }
}

/// CopyPaste

declare module 'diagram-js/lib/features/copy-paste' {
  import { DJSModule } from 'diagram-js'

  const copyPasteModule: DJSModule
  export default copyPasteModule
}

declare module 'diagram-js/lib/features/copy-paste/CopyPaste' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import ElementFactory from 'diagram-js/lib/core/ElementFactory'
  import EventBus from 'diagram-js/lib/core/EventBus'
  import Clipboard from 'diagram-js/lib/features/clipboard/Clipboard'
  import Create from 'diagram-js/lib/features/create/Create'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import Mouse from 'diagram-js/lib/features/mouse/Mouse'
  import Rules from 'diagram-js/lib/features/rules/Rules'

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
  }
}

/// KeyboardMoveSelection

declare module 'diagram-js/lib/features/keyboard-move-selection' {
  import { DJSModule } from 'diagram-js'

  const keyboardMoveSelectionModule: DJSModule
  export default keyboardMoveSelectionModule
}

declare module 'diagram-js/lib/features/keyboard-move-selection/KeyboardMoveSelection' {
  import Keyboard from 'diagram-js/lib/features/keyboard/Keyboard'
  import Modeling from 'diagram-js/lib/features/modeling/Modeling'
  import Rules from 'diagram-js/lib/features/rules/Rules'
  import Selection from 'diagram-js/lib/features/selection/Selection'

  export default class KeyboardMoveSelection {
    constructor(config: any, keyboard: Keyboard, modeling: Modeling, rules: Rules, selection: Selection)

    moveSelection(direction: string, accelerated: boolean): void
  }
}

/// ZoomScroll

declare module 'diagram-js/lib/navigation/zoomscroll' {
  import { DJSModule } from 'diagram-js'

  const zoomScrollModule: DJSModule
  export default zoomScrollModule
}

/// MoveCanvas

declare module 'diagram-js/lib/navigation/movecanvas' {
  import { DJSModule } from 'diagram-js'

  const moveCanvasModule: DJSModule
  export default moveCanvasModule
}

/// KeyboardMove

declare module 'diagram-js/lib/navigation/keyboard-move' {
  import { DJSModule } from 'diagram-js'

  const keyboardMoveModule: DJSModule
  export default keyboardMoveModule
}

declare module 'diagram-js/lib/navigation/keyboard-move/KeyboardMove' {
  import Canvas from 'diagram-js/lib/core/Canvas'
  import Keyboard from 'diagram-js/lib/features/keyboard/Keyboard'

  export default class KeyboardMove {
    constructor(config: any, keyboard: Keyboard, canvas: Canvas)

    moveCanvas(opts: { speed: number; direction: 'left' | 'up' | 'right' | 'down' }): void
  }

  export interface KeyboardMoveConfig {
    moveSpeed: number
    moveSpeedAccelerated: number
  }
}

/// CroppingConnectionDocking

declare module 'diagram-js/lib/layout/CroppingConnectionDocking' {
  import ElementRegistry from 'diagram-js/lib/core/ElementRegistry'
  import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory'

  export default class CroppingConnectionDocking {
    constructor(elementRegistry: ElementRegistry, graphicsFactory: GraphicsFactory)
  }
}

/// Command

declare module 'diagram-js/lib/command' {
  export interface Command {
    preExecute(context: any): void
    execute(context: any): any
    revert(context: any): any
    postExecute(context: any): void
  }
}

/// CommandStack

declare module 'diagram-js/lib/command/CommandStack' {
  import EventBus from 'diagram-js/lib/core/EventBus'
  import { Injector } from 'didi'

  export default class CommandStack {
    constructor(eventBus: EventBus, injector: Injector)

    execute(command: string, context: any): void
    registerHandler(command: string, handlerCls: new (...args: any[]) => any): void
  }
}
