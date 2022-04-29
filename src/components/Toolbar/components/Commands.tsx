import { defineComponent } from 'vue'
import { NButton, NButtonGroup, NIcon } from 'naive-ui'
import RedoRound from '@vicons/material/RedoRound'
import UndoRound from '@vicons/material/UndoRound'

const Commands = defineComponent({
  setup() {
    return () => (
      <NButtonGroup>
        <NButton>
          <NIcon component={UndoRound}></NIcon>
        </NButton>
        <NButton>111</NButton>
        <NButton>111</NButton>
        <NButton>
          <NIcon component={RedoRound}></NIcon>
        </NButton>
      </NButtonGroup>
    )
  }
})

export default Commands
