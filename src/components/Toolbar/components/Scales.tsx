import { defineComponent } from 'vue'
import { NButton, NButtonGroup, NIcon } from 'naive-ui'
import ZoomOutRound from '@vicons/material/ZoomOutRound'
import ZoomInRound from '@vicons/material/ZoomInRound'

const Scales = defineComponent({
  setup() {
    return () => (
      <NButtonGroup>
        <NButton>
          <NIcon component={ZoomOutRound}></NIcon>
        </NButton>
        <NButton>111</NButton>
        <NButton>
          <NIcon component={ZoomInRound}></NIcon>
        </NButton>
      </NButtonGroup>
    )
  }
})

export default Scales
