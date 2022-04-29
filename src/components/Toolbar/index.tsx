import { defineComponent } from 'vue'
import { NButton, NPopover } from 'naive-ui'

const Toolbar = defineComponent({
  setup() {
    return () => (
      <div class="toolbar">
        <NPopover>
          <NButton v-slot="trigger">按钮</NButton>
        </NPopover>
      </div>
    )
  }
})

export default Toolbar
