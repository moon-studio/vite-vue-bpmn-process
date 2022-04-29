import { defineComponent } from 'vue'
import { NButton } from 'naive-ui'

const Imports = defineComponent({
  setup() {
    return () => (
      <NButton type="info" secondary>
        打开文件
      </NButton>
    )
  }
})

export default Imports
