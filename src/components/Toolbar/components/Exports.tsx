import { defineComponent } from 'vue'
import { NButton, NPopover } from 'naive-ui'
import { downloadFile, setEncoded } from '@/utils/files'
import modeler from '@/store/modeler'

const Exports = defineComponent({
  name: 'Exports',
  setup() {
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
              导出为...
            </NButton>
          ),
          default: () => (
            <div class="button-list_column">
              <NButton type="info" onClick={downloadProcessAsBpmn}>
                导出为Bpmn
              </NButton>
              <NButton type="info" onClick={downloadProcessAsXml}>
                导出为XML
              </NButton>
              <NButton type="info" onClick={downloadProcessAsSvg}>
                导出为SVG
              </NButton>
            </div>
          )
        }}
      ></NPopover>
    )
  }
})

export default Exports
