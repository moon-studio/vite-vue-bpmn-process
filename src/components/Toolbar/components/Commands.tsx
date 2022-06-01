import { defineComponent } from 'vue'
import { NButton, NButtonGroup, NIcon, NPopover } from 'naive-ui'
import RedoRound from '@vicons/material/RedoRound'
import UndoRound from '@vicons/material/UndoRound'
import RestartAltRound from '@vicons/material/RestartAltRound'
import EventEmitter from '@/utils/EventEmitter'
import type Modeler from 'bpmn-js/lib/Modeler'
import type CommandStack from 'diagram-js/lib/command/CommandStack'
import { createNewDiagram } from '@/utils'
import ZoomOutRound from '@vicons/material/ZoomOutRound'

const Commands = defineComponent({
  name: 'Commands',
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
        <NPopover
          v-slots={{
            default: () => '撤销',
            trigger: () => (
              <NButton onClick={undo}>
                <NIcon component={UndoRound}></NIcon>
              </NButton>
            )
          }}
        ></NPopover>
        <NPopover
          v-slots={{
            default: () => '恢复',
            trigger: () => (
              <NButton onClick={redo}>
                <NIcon component={RedoRound}></NIcon>
              </NButton>
            )
          }}
        ></NPopover>
        <NPopover
          v-slots={{
            default: () => '重做',
            trigger: () => (
              <NButton onClick={restart}>
                <NIcon component={RestartAltRound}></NIcon>
              </NButton>
            )
          }}
        ></NPopover>
      </NButtonGroup>
    )
  }
})

export default Commands
