<template>
  <div ref="designer" class="process-designer"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref, toRefs } from 'vue'
  import Modeler from 'bpmn-js/lib/Modeler'
  import EventEmitter from '@/utils/EventEmitter'
  import emptyXML from '@/utils/emptyXML'

  export default defineComponent({
    name: 'Designer',
    props: {
      xml: {
        type: String,
        default: () => emptyXML('process_1', '流程图1.0')
      },
      processId: {
        type: String,
        default: undefined
      },
      processName: {
        type: String,
        default: undefined
      },
      prefix: {
        type: String,
        default: undefined
      }
    },
    emits: ['update:xml', 'command-stack-changed'],
    setup(props, { emit }) {
      const designer = ref<HTMLDivElement | null>(null)
      const { processId, processName, prefix, xml } = toRefs(props)

      // 将字符串转换成图显示出来
      const createNewDiagram = async function (xml) {
        let newId = processId.value || `Process_${new Date().getTime()}`
        let newName = processName.value || `业务流程_${new Date().getTime()}`
        let xmlString = xml || emptyXML(newId, newName, prefix.value)
        try {
          const { modeler } = window.bpmnInstances
          let { warnings } = await modeler.importXML(xmlString)
          if (warnings && warnings.length) {
            warnings.forEach((warn) => console.warn(warn))
          }
        } catch (e) {
          console.error(`[Process Designer Warn]: ${typeof e === 'string' ? e : (e as Error)?.message}`)
        }
      }

      onMounted(() => {
        const modeler: Modeler = new Modeler({
          container: designer.value as HTMLElement,
          keyboard: {
            bindTo: designer.value
          }
        })

        console.log('[Process Designer]', modeler, modeler.getDefinitions())

        console.log('[Process Designer]', modeler.get('modeling'))

        !window.bpmnInstances && (window.bpmnInstances = {})
        window.bpmnInstances.modeler = modeler

        modeler.on('commandStack.changed', async (event) => {
          try {
            const { xml } = await modeler.saveXML({ format: true })
            emit('update:xml', xml)
            emit('command-stack-changed', event)
          } catch (error) {
            console.error(error)
          }
        })

        createNewDiagram(xml.value)

        EventEmitter.instance.emit('modeler-init', modeler)
      })

      return {
        designer,
        createNewDiagram
      }
    }
  })
</script>
