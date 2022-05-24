import { ModuleDeclaration } from 'didi'
import enhancementContextPadProvider from './enhancementContextPadProvider'

const enhancementContextPad: ModuleDeclaration = {
  __init__: ['enhancementContextPadProvider'],
  enhancementContextPadProvider: ['type', enhancementContextPadProvider]
}

export default enhancementContextPad
