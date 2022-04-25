import { defineComponent } from 'vue'
import { NCollapse, NCollapseItem } from 'naive-ui'

const props = {}

const Palette = defineComponent({
  setup() {
    return () => (
      <div class="palette">
        <NCollapse>
          <NCollapseItem title="工具" name="tools">
            工具部分
          </NCollapseItem>
          <NCollapseItem title="事件" name="events">
            事件部分
          </NCollapseItem>
          <NCollapseItem title="任务" name="tasks">
            任务部分
          </NCollapseItem>
          <NCollapseItem title="网关" name="gateways">
            网关部分
          </NCollapseItem>
        </NCollapse>
      </div>
    )
  }
})

export default Palette
