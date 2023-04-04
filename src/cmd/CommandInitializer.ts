import type EventBus from 'diagram-js/lib/core/EventBus'
import type CommandStack from 'diagram-js/lib/command/CommandStack'
import type CommandHandler from 'diagram-js/lib/command/CommandHandler'
import MultiCommandHandler from './MultiCommandHandler'
import type { CommandHandlerConstructor } from 'diagram-js/lib/command/CommandStack'

const HANDLERS: Record<string, CommandHandlerConstructor> = {
  'panel.multi-command': MultiCommandHandler
}

export default class CommandInitializer implements CommandHandler {
  static $inject: string[]
  constructor(eventBus: EventBus, commandStack: CommandStack) {
    eventBus.on('diagram.init', function () {
      Object.keys(HANDLERS).forEach((id: string) => commandStack.registerHandler(id, HANDLERS[id]))
    })
  }
}

CommandInitializer.$inject = ['eventBus', 'commandStack']
