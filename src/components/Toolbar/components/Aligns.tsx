import { Component, defineComponent } from 'vue'
import { NButton, NButtonGroup, NIcon, NPopover, useMessage } from 'naive-ui'
import AlignHorizontalLeftRound from '@vicons/material/AlignHorizontalLeftRound'
import AlignHorizontalCenterRound from '@vicons/material/AlignHorizontalCenterRound'
import AlignHorizontalRightRound from '@vicons/material/AlignHorizontalRightRound'
import AlignVerticalTopRound from '@vicons/material/AlignVerticalTopRound'
import AlignVerticalCenterRound from '@vicons/material/AlignVerticalCenterRound'
import AlignVerticalBottomRound from '@vicons/material/AlignVerticalBottomRound'
import Modeler from 'bpmn-js/lib/Modeler'
import Selection from 'diagram-js/lib/features/selection/Selection'
import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js'
import EventEmitter from '@/utils/EventEmitter'

const Aligns = defineComponent({
  setup() {
    const buttons: { name: string; key: string; icon: Component }[] = [
      { name: '左对齐', key: 'left', icon: AlignHorizontalLeftRound },
      { name: '水平居中', key: 'center', icon: AlignHorizontalCenterRound },
      { name: '右对齐', key: 'right', icon: AlignHorizontalRightRound },
      { name: '上对齐', key: 'top', icon: AlignVerticalTopRound },
      { name: '垂直居中', key: 'middle', icon: AlignVerticalCenterRound },
      { name: '下对齐', key: 'bottom', icon: AlignVerticalBottomRound }
    ]

    const message = useMessage()

    let modeling: Modeling | null = null
    let selection: Selection | null = null
    let align: any = null

    EventEmitter.instance.on('modeler-init', (modeler: Modeler) => {
      modeling = modeler.get('modeling')
      selection = modeler.get('selection')
      align = modeler.get('alignElements')
    })

    const alignElements = (tag: string) => {
      if (modeling && selection) {
        const SelectedElements = selection.get()
        if (!SelectedElements || SelectedElements.length <= 1) {
          return message.warning('请按住 Ctrl 键选择多个元素对齐')
        }
        align.trigger(SelectedElements, tag)
      }
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
