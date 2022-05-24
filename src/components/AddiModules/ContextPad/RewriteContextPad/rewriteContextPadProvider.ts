import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider'
import { Injector } from 'didi'
import EventBus from 'diagram-js/lib/core/EventBus'
import ContextPad from 'diagram-js/lib/features/context-pad/ContextPad'
import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js'
import ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory'
import Connect from 'diagram-js/lib/features/connect/Connect'
import Create from 'diagram-js/lib/features/create/Create'
import PopupMenu from 'diagram-js/lib/features/popup-menu/PopupMenu'
import Canvas from 'diagram-js/lib/core/Canvas'
import Rules from 'diagram-js/lib/features/rules/Rules'
import { Translate } from 'diagram-js/lib/i18n/translate'

class RewriteContextPadProvider extends ContextPadProvider {
  constructor(
    config: any,
    injector: Injector,
    eventBus: EventBus,
    contextPad: ContextPad,
    modeling: Modeling,
    elementFactory: ElementFactory,
    connect: Connect,
    create: Create,
    popupMenu: PopupMenu,
    canvas: Canvas,
    rules: Rules,
    translate: Translate
  ) {
    super(
      config,
      injector,
      eventBus,
      contextPad,
      modeling,
      elementFactory,
      connect,
      create,
      popupMenu,
      canvas,
      rules,
      translate,
      2000
    )
  }
}

export default RewriteContextPadProvider
