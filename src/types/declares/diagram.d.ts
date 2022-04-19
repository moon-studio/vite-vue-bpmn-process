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

export interface KeyboardConfig<T extends Element> {
  bindTo: T
}
export interface DJSModule {
  __depends__?: DJSModule[]
  __init__?: any[]
  [id: string]: undefined | any[] | DJSModule[] | ['type' | 'factory' | 'value', any]
}

declare module 'diagram-js' {
  export default class Diagram {
    constructor(options?: ViewerOptions, injector?: any)
    get<T extends ServiceName | string>(service: T): Service<T>
    invoke(fn: (...v: any[]) => void | any[]): void
    destroy(): void
    clear(): void
  }
}
