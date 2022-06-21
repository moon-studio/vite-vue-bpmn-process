import { ModuleDeclaration } from 'didi'
import rewriteContextPadProvider from './rewriteContextPadProvider'

const rewriteContextPad: ModuleDeclaration = {
  __init__: ['contextPadProvider'],
  contextPadProvider: ['type', rewriteContextPadProvider]
}

export default rewriteContextPad
