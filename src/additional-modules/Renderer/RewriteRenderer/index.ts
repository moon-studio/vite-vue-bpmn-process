import RewriteRenderer from './RewriteRenderer'
import { ModuleDeclaration } from 'didi'

const rewriteRenderer: ModuleDeclaration = {
  __init__: ['bpmnRenderer'],
  bpmnRenderer: ['type', RewriteRenderer]
}

export default rewriteRenderer
