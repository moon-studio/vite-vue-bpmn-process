import { ModuleDeclaration } from 'didi'
import enhancementPaletteProvider from './enhancementPaletteProvider'

const EnhancementPalette: ModuleDeclaration = {
  __init__: ['enhancementPaletteProvider'],
  enhancementPaletteProvider: ['type', enhancementPaletteProvider]
}

export default EnhancementPalette
