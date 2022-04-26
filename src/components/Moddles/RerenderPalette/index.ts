import { ModuleDeclaration } from 'didi'
import rerenderPaletteProvider from './rerenderPaletteProvider'

const RerenderPalette: ModuleDeclaration = {
  __init__: ['rerenderPalette'],
  rerenderPalette: rerenderPaletteProvider
}

export default RerenderPalette
