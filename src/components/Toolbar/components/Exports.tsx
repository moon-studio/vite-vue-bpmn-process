import { defineComponent } from 'vue'
import { NButton, NPopover } from 'naive-ui'

const Exports = defineComponent({
  setup() {
    return () => (
      <NPopover
        v-slots={{
          trigger: () => (
            <NButton type="info" secondary>
              导出为...
            </NButton>
          ),
          default: () => (
            <div class="button-list_column">
              <NButton type="info">导出为Bpmn</NButton>
              <NButton type="info">导出为XML</NButton>
              <NButton type="info">导出为SVG</NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Exports
