import EnhancementRendererProvider from './EnhancementRendererProvider'
import { ModuleDeclaration } from 'didi'

const enhancementRenderer: ModuleDeclaration = {
  __init__: ['enhancementRenderer'],
  enhancementRenderer: ['type', EnhancementRendererProvider]
}

export default enhancementRenderer
