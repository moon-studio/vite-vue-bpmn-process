import { defineComponent } from 'vue'
import { NButton, NButtonGroup, NIcon } from 'naive-ui'
import RedoRound from '@vicons/material/RedoRound'
import UndoRound from '@vicons/material/UndoRound'
import RestartAltRound from '@vicons/material/RestartAltRound'
import EventEmitter from '@/utils/EventEmitter'
import type Modeler from 'bpmn-js/lib/Modeler'
import type CommandStack from 'diagram-js/lib/command/CommandStack'
import { createNewDiagram } from '@/utils'

const Commands = defineComponent({
  setup() {
    let command: CommandStack | null = null

    EventEmitter.instance.on('modeler-init', (modeler: Modeler) => {
      command = modeler.get<CommandStack>('commandStack')
    })

    const undo = () => {
      command && command.canUndo() && command.undo()
    }

    const redo = () => {
      command && command.canRedo() && command.redo()
    }

    const restart = () => {
      command && command.clear()
      createNewDiagram()
    }

    return () => (
      <NButtonGroup>
        <NButton onClick={undo}>
          <NIcon component={UndoRound}></NIcon>
        </NButton>
        <NButton onClick={redo}>
          <NIcon component={RedoRound}></NIcon>
        </NButton>
        <NButton onClick={restart}>
          <NIcon component={RestartAltRound}></NIcon>
        </NButton>
      </NButtonGroup>
    )
  }
})

export default Commands
