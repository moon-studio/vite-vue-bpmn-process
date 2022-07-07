<template>
  <n-collapse-item name="element-conditional">
    <template #header>
      <collapse-title title="条件设置">
        <lucide-icon name="ArrowLeftRight" />
      </collapse-title>
    </template>
    <div class="element-conditional">
      <template v-if="varVisible">
        <edit-item key="variableName" label="Variable Name" :label-width="120">
          <n-input v-model:value="variableName" maxlength="32" @change="setElementVariableName" />
        </edit-item>
        <edit-item
          v-if="varEventVisible"
          key="variableEvent"
          label="Variable Events"
          :label-width="120"
        >
          <n-input v-model:value="variableEvents" @change="setElementVariableEvents" />
        </edit-item>
      </template>
      <edit-item key="condition" label="条件类型" :label-width="120">
        <n-select
          v-model:value="conditionType"
          :options="conditionTypeOptions"
          @update:value="setElementConditionType"
        />
      </edit-item>
      <edit-item
        v-if="conditionType && conditionType === 'expression'"
        key="expression"
        label="Expression"
        :label-width="120"
      >
        <n-input v-model:value="expression" @change="setConditionExpression" />
      </edit-item>
    </div>
  </n-collapse-item>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, ref } from 'vue'
  import modeler from '@/store/modeler'
  import { Base } from 'diagram-js/lib/model'
  import {
    getConditionExpressionValue,
    getConditionTypeValue,
    getVariableEventsValue,
    getVariableNameValue,
    isConditionEventDefinition,
    isExtendStartEvent,
    setConditionExpressionValue,
    setConditionTypeValue,
    setVariableEventsValue,
    setVariableNameValue
  } from '@/bo-utils/conditionUtil'
  import EventEmitter from '@/utils/EventEmitter'

  export default defineComponent({
    name: 'ElementConditional',
    setup() {
      const modelerStore = modeler()
      const getActive = computed<Base | null>(() => modelerStore.getActive!)
      const getActiveId = computed<string>(() => modelerStore.getActiveId!)

      // 变量配置部分
      const varVisible = ref<boolean>(false)
      const variableName = ref<string | undefined>(undefined)
      const varEventVisible = ref<boolean>(false)
      const variableEvents = ref<string | undefined>(undefined)
      const getElementVariables = () => {
        varVisible.value = isConditionEventDefinition(getActive.value!)
        variableName.value = getVariableNameValue(getActive.value!)
        if (varVisible.value) {
          varEventVisible.value = !isExtendStartEvent(getActive.value!)
          variableEvents.value = getVariableEventsValue(getActive.value!)
        }
      }
      const setElementVariableName = (value: string | undefined) => {
        setVariableNameValue(getActive.value!, value)
      }
      const setElementVariableEvents = (value: string | undefined) => {
        setVariableEventsValue(getActive.value!, value)
      }

      // 条件类型配置部分
      const conditionTypeOptions = ref<Record<string, string>[]>([
        { label: 'None', value: '' },
        { label: 'Default', value: 'default' },
        { label: 'Expression', value: 'expression' },
        { label: 'Script', value: 'script' }
      ])
      const conditionType = ref<string>('')
      const getElementConditionType = () => {
        conditionType.value = getConditionTypeValue(getActive.value!)
        conditionType.value === 'expression' && getConditionExpression()
      }
      const setElementConditionType = (value: string) => {
        setConditionTypeValue(getActive.value!, value)
      }

      //
      const expression = ref<string | undefined>(undefined)
      const getConditionExpression = () => {
        getConditionExpressionValue(getActive.value!)
      }
      const setConditionExpression = (value: string | undefined) => {
        setConditionExpressionValue(getActive.value!, value)
      }

      onMounted(() => {
        getElementVariables()
        getElementConditionType()
        EventEmitter.on('element-update', () => {
          getElementVariables()
          getElementConditionType()
        })
      })

      return {
        varVisible,
        varEventVisible,
        variableName,
        variableEvents,
        setElementVariableName,
        setElementVariableEvents,
        conditionTypeOptions,
        conditionType,
        setElementConditionType,
        expression,
        setConditionExpression
      }
    }
  })
</script>
