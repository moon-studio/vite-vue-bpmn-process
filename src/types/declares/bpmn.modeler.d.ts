interface ModelerOptions {
  container: DOMElement // required - the DOM element that will contain the BPMN 2.0 diagram
  width?: number | string // optional - the initial width for the diagram, default: '100%'
  height?: number | string // optional - the initial height for the diagram, default: '100%'
  additionalModules?: any[] // optional - additional modules to use, list of objects with properties name and init (see documentation in bpmn-js/lib/Modeler), 功能扩展模块
  moddleExtensions?: any // optional - the moddle extensions to use, default: { camunda: camundaModdleDescriptor }, 定义模块
  keyboard?: any // optional - the keyboard configuration to use, default: {}
}

declare class Diagram {
  constructor(options: ModelerOptions)
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

declare class Modeler extends Diagram {
  get(name: string): any // 获取功能模块实例
  createDiagram(xml: string): void // 创建流程图
}

declare module 'bpmn-js/lib/Modeler' {
  export = Modeler
}
