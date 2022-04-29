import { defineComponent } from 'vue'
import { NButton, NPopover } from 'naive-ui'

const Exports = defineComponent({
  setup() {
    return () => (
      <NPopover
        v-slots={{
          trigger: () => <NButton>导出为...</NButton>,
          default: () => (
            <div>
              <NButton>导出为Bpmn</NButton>
              <NButton>导出为XML</NButton>
              <NButton>导出为SVG</NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Exports
