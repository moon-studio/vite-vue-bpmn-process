import { defineComponent } from 'vue'
import { NButton, NPopover } from 'naive-ui'

const Previews = defineComponent({
  setup() {
    return () => (
      <NPopover
        v-slots={{
          trigger: () => <NButton>预览文件</NButton>,
          default: () => (
            <div class="button-list_column">
              <NButton>预览XML</NButton>
              <NButton>预览JSON</NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Previews
