declare module 'bpmn-moddle' {
  import { Moddle, Package } from 'moddle'
  import { ModdleElement } from 'diagram-js/lib/model'

  type ParseResult = {
    rootElement: ModdleElement
    references: Object[]
    warnings: Error[]
    elementsById: { [key: string]: ModdleElement }
  }
  type ParseError = {
    warnings: Error[]
  }

  type SerializationResult = {
    xml: string
  }

  export default class BpmnModdle extends Moddle {
    constructor(packages?: Package[], options?: Object)
    fromXML(xmlStr: string, typeName?: string | Object, options?: Object): Promise<ParseResult | ParseError>
    toXML(element: string, options?: Object): Promise<SerializationResult | Error>
  }
}
