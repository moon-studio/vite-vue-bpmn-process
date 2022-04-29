import { Component, defineComponent } from 'vue'
import { NButton, NButtonGroup, NIcon, NPopover } from 'naive-ui'
import AlignHorizontalLeftRound from '@vicons/material/AlignHorizontalLeftRound'
import AlignHorizontalCenterRound from '@vicons/material/AlignHorizontalCenterRound'
import AlignHorizontalRightRound from '@vicons/material/AlignHorizontalRightRound'
import AlignVerticalTopRound from '@vicons/material/AlignVerticalTopRound'
import AlignVerticalCenterRound from '@vicons/material/AlignVerticalCenterRound'
import AlignVerticalBottomRound from '@vicons/material/AlignVerticalBottomRound'

const Aligns = defineComponent({
  setup() {
    const buttons: { name: string; key: string; icon: Component }[] = [
      { name: '左对齐', key: 'left', icon: AlignHorizontalLeftRound },
      { name: '水平居中', key: 'horizontal', icon: AlignHorizontalCenterRound },
      { name: '右对齐', key: 'right', icon: AlignHorizontalRightRound },
      { name: '上对齐', key: 'top', icon: AlignVerticalTopRound },
      { name: '垂直居中', key: 'vertical', icon: AlignVerticalCenterRound },
      { name: '下对齐', key: 'bottom', icon: AlignVerticalBottomRound }
    ]

    const alignElements = (tag: string) => {
      console.log(tag)
    }

    return () => (
      <NButtonGroup>
        {buttons.map((item) => {
          return (
            <NPopover
              v-slots={{
                default: () => item.name,
                trigger: () => (
                  <NButton onClick={() => alignElements(item.key)}>
                    <NIcon component={item.icon}></NIcon>
                  </NButton>
                )
              }}
            ></NPopover>
          )
        })}
      </NButtonGroup>
    )
  }
})

export default Aligns
