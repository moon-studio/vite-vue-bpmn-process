import { defineComponent } from 'vue'

import BpmnModdle from 'bpmn-moddle'
import modeler from '@/store/modeler'
import { NButton, NPopover, NCode, useMessage, useDialog } from 'naive-ui'

const Previews = defineComponent({
  name: 'Previews',
  setup() {
    const previewModel = useDialog()
    const message = useMessage()
    const modelerStore = modeler()

    const moddle = new BpmnModdle()

    const openXMLPreviewModel = async () => {
      try {
        const modeler = modelerStore.getModeler!

        if (!modeler) {
          return message.warning('模型加载失败，请刷新重试')
        }

        const { xml } = await modeler.saveXML({ format: true, preamble: true })

        previewModel.create({
          title: '流程预览',
          showIcon: false,
          content: () => (
            <div class="preview-model">
              <NCode code={xml!} language="xml" wordWrap={true}></NCode>
            </div>
          )
        })
      } catch (e) {
        message.error((e as Error).message || (e as string))
      }
    }

    const openJsonPreviewModel = async () => {
      const modeler = modelerStore.getModeler!

      if (!modeler) {
        return message.warning('模型加载失败，请刷新重试')
      }

      const { xml } = await modeler.saveXML({ format: true })

      const jsonStr = await moddle.fromXML(xml!)

      previewModel.create({
        title: '流程预览',
        showIcon: false,
        content: () => (
          <div class="preview-model">
            <NCode code={JSON.stringify(jsonStr, null, 2)} language="json" wordWrap={true}></NCode>
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
              <NButton type="info" onClick={openXMLPreviewModel}>
                预览XML
              </NButton>
              <NButton type="info" onClick={openJsonPreviewModel}>
                预览JSON
              </NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Previews
