import RewriteRendererProvider from './RewriteRendererProvider'
import { ModuleDeclaration } from 'didi'

const rewriteRenderer: ModuleDeclaration = {
  __init__: ['bpmnRenderer'],
  bpmnRenderer: ['type', RewriteRendererProvider]
}

export default rewriteRenderer
