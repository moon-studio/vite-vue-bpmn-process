import { ModuleDeclaration } from 'didi'
import enhancementPopupMenuProvider from './enhancementPopupMenuProvider'

const enhancementPopupMenu: ModuleDeclaration = {
  __init__: ['enhancementPopupMenuProvider'],
  enhancementPopupMenuProvider: ['type', enhancementPopupMenuProvider]
}

export default enhancementPopupMenu
