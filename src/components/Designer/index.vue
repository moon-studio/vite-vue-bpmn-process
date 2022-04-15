<template>
  <div ref="designer" class="process-designer"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue'
  import Modeler from 'bpmn-js/lib/Modeler'
  import EventEmitter from '@/utils/EventEmitter'

  export default defineComponent({
    name: 'Designer',
    props: {
      value: {
        type: String,
        default: () => ''
      }
    },
    emits: ['update:value', 'command-stack-changed'],
    setup(props, { emit }) {
      const designer = ref<HTMLDivElement | null>(null)

      onMounted(() => {
        const modeler = new Modeler({
          container: designer.value,
          keyboard: {
            bindTo: designer.value
          }
        })

        !window.bpmnInstances && (window.bpmnInstances = {})
        window.bpmnInstances.modeler = modeler

        modeler.on('commandStack.changed', async (event) => {
          try {
            const { xml } = await modeler.saveXML({ format: true })
            emit('update:value', xml)
            emit('command-stack-changed', event)
          } catch (error) {
            console.error(error)
          }
        })

        EventEmitter.instance.emit('modeler-init', modeler)
      })

      return {
        designer
      }
    }
  })
</script>
