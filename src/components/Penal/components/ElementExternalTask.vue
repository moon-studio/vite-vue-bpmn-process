<template>
  <n-collapse-item name="element-external-task">
    <template #header>
      <collapse-title title="外部任务">
        <lucide-icon name="Info" />
      </collapse-title>
    </template>
    <div class="element-external-task">
      <edit-item label="任务优先级" :label-width="120">
        <n-input v-model:value="taskPriority" maxlength="32" @change="setExternalTaskPriority" />
      </edit-item>
    </div>
  </n-collapse-item>
</template>

<script lang="ts">
  import { computed, defineComponent, ref, watch } from 'vue'
  import modeler from '@/store/modeler'
  import { getExternalTaskValue, setExternalTaskValue } from '@/bo-utils/externalTaskUtil'
  import { Base } from 'diagram-js/lib/model'

  export default defineComponent({
    name: 'ElementExternalTask',
    setup() {
      const modelerStore = modeler()
      const getActive = computed<Base | null>(() => modelerStore.getActive!)
      const getActiveId = computed<string>(() => modelerStore.getActiveId!)

      const taskPriority = ref<string | undefined>(undefined)

      const getExternalTaskPriority = () => {
        taskPriority.value = getExternalTaskValue(getActive.value!)
      }

      const setExternalTaskPriority = (value: string | undefined) => {
        setExternalTaskValue(getActive.value!, value)
      }

      watch(
        () => getActiveId.value,
        () => getExternalTaskPriority(),
        { immediate: true }
      )

      return {
        taskPriority,
        setExternalTaskPriority
      }
    }
  })
</script>
