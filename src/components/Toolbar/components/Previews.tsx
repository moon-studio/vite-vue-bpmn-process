import { defineComponent } from 'vue'
import { NButton, NPopover } from 'naive-ui'

const Previews = defineComponent({
  setup() {
    return () => (
      <NPopover
        v-slots={{
          trigger: () => <NButton>预览文件</NButton>,
          default: () => (
            <div>
              <NButton>111</NButton>
              <NButton>111</NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Previews
