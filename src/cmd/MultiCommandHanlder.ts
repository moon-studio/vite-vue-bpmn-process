import type CommandStack from 'diagram-js/lib/command/CommandStack'

export default class MultiCommandHandler {
  private readonly _commandStack: CommandStack
  static $inject: string[]

  constructor(commandStack: CommandStack) {
    this._commandStack = commandStack
  }

  preExecute(context = []) {
    const commandStack = this._commandStack

    const exec = (command) => {
      commandStack.execute(command.cmd, command.context)
    }

    context.forEach(exec)
  }
}

MultiCommandHandler.$inject = ['commandStack']
