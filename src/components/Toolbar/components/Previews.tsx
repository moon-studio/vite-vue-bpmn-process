import { defineComponent } from 'vue'
import { NButton, NCode, NPopover, useDialog, useMessage } from 'naive-ui'

import Modeler from 'bpmn-js/lib/Modeler'

const Previews = defineComponent({
  name: 'Previews',
  setup() {
    const previewModel = useDialog()
    const message = useMessage()

    const openPreviewModel = async () => {
      const modeler: Modeler | null = window.bpmnInstances.modeler

      if (!modeler) {
        return message.warning('模型加载失败，请刷新重试')
      }

      const result = await modeler.saveXML({ format: true })

      previewModel.create({
        title: '流程预览',
        showIcon: false,
        content: () => (
          <div class="preview-model">
            <NCode code={result.xml} language="xml" wordWrap={true}></NCode>
          </div>
        )
      })
    }

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
              <NButton type="info" onClick={openPreviewModel}>
                预览XML
              </NButton>
              <NButton type="info">预览JSON</NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Previews
