import CustomRendererProvider from './CustomRendererProvider'
import { ModuleDeclaration } from 'didi'

const customRenderer: ModuleDeclaration = {
  __init__: ['customRenderer'],
  customRenderer: ['type', CustomRendererProvider]
}

export default customRenderer
