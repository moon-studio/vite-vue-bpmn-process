import { defineComponent } from 'vue'
import { NButton, NPopover } from 'naive-ui'

const Previews = defineComponent({
  setup() {
    return () => (
      <NPopover
        v-slots={{
          trigger: () => (
            <NButton type="info" secondary>
              预览文件
            </NButton>
          ),
          default: () => (
            <div class="button-list_column">
              <NButton type="info">预览XML</NButton>
              <NButton type="info">预览JSON</NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Previews
