declare class Diagram {
  constructor(options: ViewerOptions)
  attachTo(element: DOMElement): void // 重新挂载
  clear(): void // 清空
  destroy(): void // 销毁
  detach(): void // 卸载
  getDefinitions(): any // 获取定义json与
  getModules(): any // 获取模块定义
  importXML(xml: string): Promise<any> // 导入xml
  off(event: string, listener: (event: any) => void): void // 移除事件
  on(event: string, listener: (event: any) => void): void // 添加事件
  open(xml: string): Promise<any> // 打开xml
  saveXML(options?: any): Promise<any> // 保存xml
  saveSVG(options?: any): Promise<any> // 保存svg
}

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

declare class Modeler extends Viewer {
  createDiagram(xml: string): void // 创建流程图
}

declare module 'bpmn-js/lib/Modeler' {
  export = Modeler
}
