/************************************* 构造函数配置项 ******************************************/
import { InjectionContext, Injector, LocalsMap } from '@/types/declares/didi.t'

export interface ViewerOptions {
  keyboard?: KeyboardConfig
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
export type KeyboardConfig<T extends Element> = {
  bindTo?: string | T
  keyboard?: {
    bindTo?: string | T
  }
}

/************************************* 回调函数参数说明 ******************************************/
export type DoneCallbackOpt = {
  warnings: string[]
  xml: string
  err?: string | string[]
}
export type EventCallbackParams = {
  newSelection: Element[]
  element: Element
  elements: Element[]
  gfx: SVGElement
  svg?: SVGElement
  originalEvent: MouseEvent
  type?: string
  viewport?: SVGElement
  viewbox?: any // 包含高宽、中心点、缩放等信息
  pad?: object
  context: unknown
}
export type Definitions = {
  [key: string]: any
}

/************************************* 基础 module ******************************************/
export interface DJSModule {
  __depends__?: DJSModule[]
  __init__?: any[]
  [id: string]: undefined | any[] | DJSModule[] | ['type' | 'factory' | 'value', any]
}

export abstract class ModdleBase {
  get(name: string): any
  set(name: string, value: any): void
}

/************************************* 元素说明 ******************************************/
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

/************************************* 基础扩展功能定义 ******************************************/

/************************************* 初始构造函数 ******************************************/
export abstract class Diagram {
  protected constructor<S extends Injector>(options?: ViewerOptions, injector?: S)
  get<T>(name: string, strict?: boolean): T
  injector: Injector
  invoke<T>(func: (...args: unknown[]) => T, context: InjectionContext, locals: LocalsMap): T
  clear(): void // 清空
  destroy(): void // 销毁
}

declare module 'diagram-js' {
  export = Diagram
}
