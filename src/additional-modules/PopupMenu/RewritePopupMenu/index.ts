import { ModuleDeclaration } from 'didi'
import rewritePopupMenuProvider from './rewritePopupMenuProvider'

const rewritePopupMenu: ModuleDeclaration = {
  __init__: ['replaceMenuProvider'],
  replaceMenuProvider: ['type', rewritePopupMenuProvider]
}

export default rewritePopupMenu
