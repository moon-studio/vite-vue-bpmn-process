<template>
  <div ref="penal" class="process-penal"></div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import EventEmitter from '@/utils/EventEmitter'
  import { BpmnElement } from 'bpmn-js'

  export default defineComponent({
    name: 'Penal',
    setup() {
      const penal = ref<HTMLDivElement | null>(null)

      const currentElement = ref<BpmnElement | null>(null)
      const currentElementId = ref<string | null>(null)
      const currentElementType = ref<string | null>(null)
      const currentElementBO = ref<string | null>(null)

      EventEmitter.instance.on('modeler-init', (modeler) => {
        modeler.on('element.click', (element) => {
          console.log(element)
          currentElement.value = element
        })
      })

      return {
        penal,
        currentElementId,
        currentElementType,
        currentElementBO
      }
    }
  })
</script>
