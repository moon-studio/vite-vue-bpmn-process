import { defineComponent } from 'vue'
import { NButton, NButtonGroup, NIcon } from 'naive-ui'
import RedoRound from '@vicons/material/RedoRound'
import UndoRound from '@vicons/material/UndoRound'
import RestartAltRound from '@vicons/material/RestartAltRound'

const Commands = defineComponent({
  setup() {
    return () => (
      <NButtonGroup>
        <NButton>
          <NIcon component={UndoRound}></NIcon>
        </NButton>
        <NButton>
          <NIcon component={RedoRound}></NIcon>
        </NButton>
        <NButton>
          <NIcon component={RestartAltRound}></NIcon>
        </NButton>
      </NButtonGroup>
    )
  }
})

export default Commands
