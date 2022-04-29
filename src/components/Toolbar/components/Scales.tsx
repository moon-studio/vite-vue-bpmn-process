import { defineComponent } from 'vue'
import { NButton, NButtonGroup } from 'naive-ui'

const Scales = defineComponent({
  setup() {
    return () => (
      <NButtonGroup>
        <NButton>111</NButton>
        <NButton>111</NButton>
        <NButton>111</NButton>
        <NButton>111</NButton>
        <NButton>111</NButton>
        <NButton>111</NButton>
      </NButtonGroup>
    )
  }
})

export default Scales
