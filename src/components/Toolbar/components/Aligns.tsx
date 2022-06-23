import { defineComponent } from 'vue'
import { NButton, NButtonGroup, NPopover } from 'naive-ui'
import Modeler from 'bpmn-js/lib/Modeler'
import Selection from 'diagram-js/lib/features/selection/Selection'
import Modeling from 'bpmn-js/lib/features/modeling/Modeling.js'
import EventEmitter from '@/utils/EventEmitter'
import LucideIcon from '@/components/common/LucideIcon.vue'

const Aligns = defineComponent({
  name: 'Aligns',
  setup() {
    const buttons: { name: string; key: string; icon: string }[] = [
      { name: '左对齐', key: 'left', icon: 'AlignStartVertical' },
      { name: '水平居中', key: 'center', icon: 'AlignCenterVertical' },
      { name: '右对齐', key: 'right', icon: 'AlignEndVertical' },
      { name: '上对齐', key: 'top', icon: 'AlignStartHorizontal' },
      { name: '垂直居中', key: 'middle', icon: 'AlignCenterHorizontal' },
      { name: '下对齐', key: 'bottom', icon: 'AlignEndHorizontal' }
    ]

    let modeling: Modeling | null = null
    let selection: Selection | null = null
    let align: any = null

    EventEmitter.on('modeler-init', (modeler: Modeler) => {
      modeling = modeler.get('modeling')
      selection = modeler.get('selection')
      align = modeler.get('alignElements')
    })

    const alignElements = (tag: string) => {
      if (modeling && selection) {
        const SelectedElements = selection.get()
        if (!SelectedElements || SelectedElements.length <= 1) {
          return window.__messageBox.warning('请按住 Ctrl 键选择多个元素对齐')
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
                    <LucideIcon name={item.icon} size={16}></LucideIcon>
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
