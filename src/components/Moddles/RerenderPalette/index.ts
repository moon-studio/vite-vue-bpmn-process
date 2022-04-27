import { ModuleDeclaration } from 'didi'
import rerenderPaletteProvider from './rerenderPaletteProvider'

const RerenderPalette: ModuleDeclaration = {
  RerenderPaletteProvider: {
    __init__: ['rerenderPalette'],
    rerenderPalette: rerenderPaletteProvider
  }
}

export default RerenderPalette
