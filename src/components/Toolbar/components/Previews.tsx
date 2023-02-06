import { defineComponent } from 'vue'

import BpmnModdle from 'bpmn-moddle'
import modeler from '@/store/modeler'
import { NButton, NPopover, NCode, useDialog } from 'naive-ui'
import { useI18n } from 'vue-i18n'

const Previews = defineComponent({
  name: 'Previews',
  setup() {
    const { t } = useI18n()
    const previewModel = useDialog()
    const modelerStore = modeler()

    const moddle = new BpmnModdle()

    const openXMLPreviewModel = async () => {
      try {
        const modeler = modelerStore.getModeler!

        if (!modeler) {
          return window.__messageBox.warning('模型加载失败，请刷新重试')
        }

        const { xml } = await modeler.saveXML({ format: true, preamble: true })

        previewModel.create({
          title: t('toolbar.previewAs'),
          showIcon: false,
          content: () => (
            <div class="preview-model">
              <NCode code={xml!} language="xml" wordWrap={true}></NCode>
            </div>
          )
        })
      } catch (e) {
        window.__messageBox.error((e as Error).message || (e as string))
      }
    }

    const openJsonPreviewModel = async () => {
      const modeler = modelerStore.getModeler!

      if (!modeler) {
        return window.__messageBox.warning('模型加载失败，请刷新重试')
      }

      const { xml } = await modeler.saveXML({ format: true })

      const jsonStr = await moddle.fromXML(xml!)

      previewModel.create({
        title: t('toolbar.previewAs'),
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
              {t('toolbar.previewAs')}
            </NButton>
          ),
          default: () => (
            <div class="button-list_column">
              <NButton type="info" onClick={openXMLPreviewModel}>
                {t('toolbar.previewAsXML')}
              </NButton>
              <NButton type="info" onClick={openJsonPreviewModel}>
                {t('toolbar.previewAsJSON')}
              </NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Previews
