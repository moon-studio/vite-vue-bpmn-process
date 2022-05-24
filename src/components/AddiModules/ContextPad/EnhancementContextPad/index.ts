import { ModuleDeclaration } from 'didi'
import enhancementContextPadProvider from './enhancementContextPadProvider'

const enhancementContextPad: ModuleDeclaration = {
  __init__: ['enhancementContextPad'],
  enhancementContextPad: ['type', enhancementContextPadProvider]
}

export default enhancementContextPad
