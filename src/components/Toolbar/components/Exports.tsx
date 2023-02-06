import { defineComponent } from 'vue'
import { NButton, NPopover } from 'naive-ui'
import { downloadFile, setEncoded } from '@/utils/files'
import modeler from '@/store/modeler'
import { useI18n } from 'vue-i18n'

const Exports = defineComponent({
  name: 'Exports',
  setup() {
    const { t } = useI18n()
    const moderlerStore = modeler()
    // 下载流程图到本地
    /**
     * @param {string} type
     * @param {*} name
     */
    const downloadProcess = async (type: string, name = 'diagram') => {
      try {
        const modeler = moderlerStore.getModeler
        // 按需要类型创建文件并下载
        if (type === 'xml' || type === 'bpmn') {
          const { err, xml } = await modeler!.saveXML()
          // 读取异常时抛出异常
          if (err) {
            console.error(`[Process Designer Warn ]: ${err.message || err}`)
          }
          const { href, filename } = setEncoded(type.toUpperCase(), name, xml!)
          downloadFile(href, filename)
        } else {
          const { err, svg } = await modeler!.saveSVG()
          // 读取异常时抛出异常
          if (err) {
            return console.error(err)
          }
          const { href, filename } = setEncoded('SVG', name, svg!)
          downloadFile(href, filename)
        }
      } catch (e: any) {
        console.error(`[Process Designer Warn ]: ${e.message || e}`)
      }
    }

    const downloadProcessAsXml = () => {
      downloadProcess('xml')
    }
    const downloadProcessAsBpmn = () => {
      downloadProcess('bpmn')
    }
    const downloadProcessAsSvg = () => {
      downloadProcess('svg')
    }

    return () => (
      <NPopover
        v-slots={{
          trigger: () => (
            <NButton type="info" secondary>
              {t('toolbar.exportAs')}
            </NButton>
          ),
          default: () => (
            <div class="button-list_column">
              <NButton type="info" onClick={downloadProcessAsBpmn}>
                {t('toolbar.exportAsBPMN')}
              </NButton>
              <NButton type="info" onClick={downloadProcessAsXml}>
                {t('toolbar.exportAsXML')}
              </NButton>
              <NButton type="info" onClick={downloadProcessAsSvg}>
                {t('toolbar.exportAsSVG')}
              </NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Exports
