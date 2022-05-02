import { defineComponent, ref } from 'vue'
import { NButton } from 'naive-ui'

const Imports = defineComponent({
  setup() {
    const importRef = ref<HTMLInputElement | null>(null)

    const openImportWindow = () => {
      importRef.value && importRef.value.click()
    }

    const changeImportFile = () => {
      if (importRef.value && importRef.value.files) {
        const file = importRef.value.files[0]
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = function () {
          const xmlStr = this.result
          window.bpmnInstances.modeler.importXML(xmlStr)
        }
      }
    }

    return () => (
      <span>
        <NButton type="info" secondary onClick={openImportWindow}>
          打开文件
        </NButton>
        <input
          type="file"
          ref={importRef}
          style="display: none"
          accept=".xml,.bpmn"
          onChange={changeImportFile}
        ></input>
      </span>
    )
  }
})

export default Imports
