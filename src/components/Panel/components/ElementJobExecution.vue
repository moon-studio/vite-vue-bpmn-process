<template>
  <n-collapse-item name="element-external-task">
    <template #header>
      <collapse-title :title="$t('panel.executionJob')">
        <lucide-icon name="CalendarClock" />
      </collapse-title>
    </template>
    <div class="element-external-task">
      <edit-item v-if="tpVisible" :label="$t('panel.taskPriority')" :label-width="100">
        <n-input v-model:value="taskPriority" maxlength="32" @change="setExternalTaskPriority" />
      </edit-item>
      <edit-item v-if="rtVisible" :label="$t('panel.retryTimeCycle')" :label-width="100">
        <n-input v-model:value="retryTimeCycle" maxlength="32" @change="setRetryTimeCycle" />
      </edit-item>
    </div>
  </n-collapse-item>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, ref, watch } from 'vue'
  import modeler from '@/store/modeler'
  import {
    getExternalTaskValue,
    getRetryTimeCycleValue,
    retryTimeCycleVisible,
    setExternalTaskValue,
    setRetryTimeCycleValue,
    taskPriorityVisible
  } from '@/bo-utils/jobExecutionUtil'
  import { Base } from 'diagram-js/lib/model'
  import EventEmitter from '@/utils/EventEmitter'

  export default defineComponent({
    name: 'ElementJobExecution',
    setup() {
      const modelerStore = modeler()
      const getActive = computed<Base | null>(() => modelerStore.getActive!)
      const getActiveId = computed<string>(() => modelerStore.getActiveId!)

      const retryTimeCycle = ref<string | undefined>(undefined)
      const rtVisible = ref<boolean>(false)
      const getRetryTimeCycle = () => {
        rtVisible.value = retryTimeCycleVisible(getActive.value!)
        retryTimeCycle.value = getRetryTimeCycleValue(getActive.value!) || ''
      }
      const setRetryTimeCycle = (value: string | undefined) => {
        setRetryTimeCycleValue(getActive.value!, value)
      }

      const taskPriority = ref<string | undefined>(undefined)
      const tpVisible = ref<boolean>(false)
      const getExternalTaskPriority = () => {
        tpVisible.value = taskPriorityVisible(getActive.value!)
        taskPriority.value = getExternalTaskValue(getActive.value!) || ''
      }
      const setExternalTaskPriority = (value: string | undefined) => {
        setExternalTaskValue(getActive.value!, value)
      }

      watch(
        () => getActiveId.value,
        () => {
          getRetryTimeCycle()
          getExternalTaskPriority()
        },
        { immediate: true }
      )

      onMounted(() => {
        getRetryTimeCycle()
        getExternalTaskPriority()

        EventEmitter.on('element-update', () => {
          getRetryTimeCycle()
          getExternalTaskPriority()
        })
      })

      return {
        retryTimeCycle,
        rtVisible,
        setRetryTimeCycle,
        taskPriority,
        tpVisible,
        setExternalTaskPriority
      }
    }
  })
</script>
