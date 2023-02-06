import { defineComponent } from 'vue'
import { NButton, NButtonGroup, NPopover } from 'naive-ui'
import EventEmitter from '@/utils/EventEmitter'
import type Modeler from 'bpmn-js/lib/Modeler'
import type CommandStack from 'diagram-js/lib/command/CommandStack'
import { createNewDiagram } from '@/utils'
import LucideIcon from '@/components/common/LucideIcon.vue'
import { useI18n } from 'vue-i18n'

const Commands = defineComponent({
  name: 'Commands',
  setup() {
    const { t } = useI18n()
    let command: CommandStack | null = null

    EventEmitter.on('modeler-init', (modeler: Modeler) => {
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
            default: () => t('toolbar.undo'),
            trigger: () => (
              <NButton onClick={undo}>
                <LucideIcon name="Undo2" size={16}></LucideIcon>
              </NButton>
            )
          }}
        ></NPopover>
        <NPopover
          v-slots={{
            default: () => t('toolbar.redo'),
            trigger: () => (
              <NButton onClick={redo}>
                <LucideIcon name="Redo2" size={16}></LucideIcon>
              </NButton>
            )
          }}
        ></NPopover>
        <NPopover
          v-slots={{
            default: () => t('toolbar.restart'),
            trigger: () => (
              <NButton onClick={restart}>
                <LucideIcon name="Eraser" size={16}></LucideIcon>
              </NButton>
            )
          }}
        ></NPopover>
      </NButtonGroup>
    )
  }
})

export default Commands
