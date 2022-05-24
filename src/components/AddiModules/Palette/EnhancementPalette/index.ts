import { ModuleDeclaration } from 'didi'
import enhancementPaletteProvider from './enhancementPaletteProvider'

const EnhancementPalette: ModuleDeclaration = {
  __init__: ['enhancementPalette'],
  enhancementPalette: ['type', enhancementPaletteProvider]
}

export default EnhancementPalette
