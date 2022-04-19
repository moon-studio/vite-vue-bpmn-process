<template>
  <div ref="penal" class="process-penal"></div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue'
  import EventEmitter from '@/utils/EventEmitter'

  export default defineComponent({
    name: 'Penal',
    setup() {
      const penal = ref<HTMLDivElement | null>(null)

      const currentElement = ref<Shape | Base | Connection | Label | null>(null)
      const currentElementId = ref<string | undefined>(undefined)
      const currentElementType = ref<string | undefined>(undefined)
      const currentElementBO = ref<ModdleElement | null>(null)

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
