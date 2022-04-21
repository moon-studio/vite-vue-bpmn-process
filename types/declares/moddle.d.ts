/************************************** 核心 Moddle 声明 *****************************************/
declare module 'moddle' {
  import { ModdleElement } from 'diagram-js/lib/model'

  export interface Package {
    name: string
    prefix: string
    types: any[]
  }
  export class Descriptor {
    ns: string
    name: string
    allTypes: string
    allTypesByName: string
    properties: string
    propertiesByName: string
    bodyProperty: string
    idProperty: string
  }
  export class Factory {
    constructor(model: Moddle, properties: Properties)
    model: Moddle
    properties: Properties
  }
  export class Properties {
    constructor(model: Moddle)
    model: Moddle
  }
  export class Registry {
    constructor(packages: Package[], properties: Properties)
  }
  export class Moddle {
    constructor(packages?: Package[])
    properties: Properties
    factory: Factory
    registry: Registry
    typeCache: { [name: string]: any }

    create(type: Descriptor, attrs: any): void
    getType(type: Descriptor): any
    createAny(name: string, nsUri: string, properties?: Properties): void
    getPackage(uriOrPrefix: { uri?: string; prefix?: string }): Package
    getElementDescriptor<E extends ModdleElement>(element: E): Descriptor
    hasType(element: ModdleElement, type: string): boolean
    getPropertyDescriptor(element: ModdleElement, property: any): Descriptor
    getTypeDescriptor(type: string): Descriptor
  }
}
