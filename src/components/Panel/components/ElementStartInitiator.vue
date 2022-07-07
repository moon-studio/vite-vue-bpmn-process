<template>
  <n-collapse-item name="element-start-initiator">
    <template #header>
      <collapse-title title="启动器">
        <lucide-icon name="PlayCircle" />
      </collapse-title>
    </template>
    <div class="element-start-initiator">
      <edit-item label="Initiator">
        <n-input v-model:value="initiator" @change="setElementInitiator" />
      </edit-item>
    </div>
  </n-collapse-item>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, ref } from 'vue'
  import { getInitiatorValue, setInitiatorValue } from '@/bo-utils/initiatorUtil'
  import modeler from '@/store/modeler'
  import { Base } from 'diagram-js/lib/model'
  import EventEmitter from '@/utils/EventEmitter'

  export default defineComponent({
    name: 'ElementStartInitiator',
    setup() {
      const modelerStore = modeler()
      const getActive = computed<Base | null>(() => modelerStore.getActive!)
      const initiator = ref<string | undefined>('')

      const getElementInitiator = () => {
        initiator.value = getInitiatorValue(getActive.value!)
      }
      const setElementInitiator = (value: string | undefined) => {
        setInitiatorValue(getActive.value!, value)
      }

      onMounted(() => {
        getElementInitiator()

        EventEmitter.on('element-update', getElementInitiator)
      })

      return {
        initiator,
        setElementInitiator
      }
    }
  })
</script>
