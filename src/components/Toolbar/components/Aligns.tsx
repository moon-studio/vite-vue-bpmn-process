import { defineComponent } from 'vue'
import { NButton, NButtonGroup, NIcon } from 'naive-ui'
import AlignHorizontalLeftRound from '@vicons/material/AlignHorizontalLeftRound'
import AlignHorizontalCenterRound from '@vicons/material/AlignHorizontalCenterRound'
import AlignHorizontalRightRound from '@vicons/material/AlignHorizontalRightRound'
import AlignVerticalTopRound from '@vicons/material/AlignVerticalTopRound'
import AlignVerticalCenterRound from '@vicons/material/AlignVerticalCenterRound'
import AlignVerticalBottomRound from '@vicons/material/AlignVerticalBottomRound'

const Aligns = defineComponent({
  setup() {
    return () => (
      <NButtonGroup>
        <NButton>
          <NIcon component={AlignHorizontalLeftRound}></NIcon>
        </NButton>
        <NButton>
          <NIcon component={AlignHorizontalCenterRound}></NIcon>
        </NButton>
        <NButton>
          <NIcon component={AlignHorizontalRightRound}></NIcon>
        </NButton>
        <NButton>
          <NIcon component={AlignVerticalTopRound}></NIcon>
        </NButton>
        <NButton>
          <NIcon component={AlignVerticalCenterRound}></NIcon>
        </NButton>
        <NButton>
          <NIcon component={AlignVerticalBottomRound}></NIcon>
        </NButton>
      </NButtonGroup>
    )
  }
})

export default Aligns
