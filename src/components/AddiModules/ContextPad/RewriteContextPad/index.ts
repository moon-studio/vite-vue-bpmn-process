import { ModuleDeclaration } from 'didi'
import rewriteContextPadProvider from './rewriteContextPadProvider'

const rewriteContextPad: ModuleDeclaration = {
  __init__: ['contextPad'],
  contextPad: ['type', rewriteContextPadProvider]
}

export default rewriteContextPad
