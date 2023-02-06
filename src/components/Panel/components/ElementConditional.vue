<template>
  <n-collapse-item name="element-conditional">
    <template #header>
      <collapse-title :title="$t('panel.conditionalSettings')">
        <lucide-icon name="ArrowLeftRight" />
      </collapse-title>
    </template>
    <div class="element-conditional">
      <template v-if="varVisible">
        <edit-item key="variableName" :label="$t('panel.variableName')" :label-width="120">
          <n-input v-model:value="variableName" maxlength="32" @change="setElementVariableName" />
        </edit-item>
        <edit-item
          v-if="varEventVisible"
          key="variableEvent"
          :label="$t('panel.variableEvents')"
          :label-width="120"
        >
          <n-input v-model:value="variableEvents" @change="setElementVariableEvents" />
        </edit-item>
      </template>
      <edit-item key="condition" :label="$t('panel.conditionType')" :label-width="120">
        <n-select
          v-model:value="conditionData.conditionType"
          :options="conditionTypeOptions"
          @update:value="setElementConditionType"
        />
      </edit-item>
      <edit-item
        v-if="conditionData.conditionType && conditionData.conditionType === 'expression'"
        key="expression"
        :label="$t('panel.conditionExpression')"
        :label-width="120"
      >
        <n-input v-model:value="conditionData.expression" @change="setConditionExpression" />
      </edit-item>
      <template v-if="conditionData.conditionType && conditionData.conditionType === 'script'">
        <edit-item key="scriptType" :label="$t('panel.scriptType')" :label-width="120">
          <n-select
            v-model:value="conditionData.scriptType"
            :options="scriptTypeOptions"
            @update:value="setElementConditionScriptType"
          />
        </edit-item>
        <edit-item key="scriptLanguage" :label="$t('panel.scriptLanguage')" :label-width="120">
          <n-input v-model:value="conditionData.language" @change="setConditionScriptLanguage" />
        </edit-item>
        <edit-item
          v-show="conditionData.scriptType === 'inline'"
          key="scriptBody"
          :label="$t('panel.scriptBody')"
          :label-width="120"
        >
          <n-input
            v-model:value="conditionData.body"
            type="textarea"
            @change="setConditionScriptBody"
          />
        </edit-item>
        <edit-item
          v-show="conditionData.scriptType === 'external'"
          key="scriptResource"
          :label="$t('panel.scriptResource')"
          :label-width="120"
        >
          <n-input v-model:value="conditionData.resource" @change="setConditionScriptResource" />
        </edit-item>
      </template>
    </div>
  </n-collapse-item>
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, ref } from 'vue'
  import modeler from '@/store/modeler'
  import { Base } from 'diagram-js/lib/model'
  import { scriptTypeOptions } from '@/config/selectOptions'
  import * as CU from '@/bo-utils/conditionUtil'
  import EventEmitter from '@/utils/EventEmitter'

  export default defineComponent({
    name: 'ElementConditional',
    setup() {
      const modelerStore = modeler()
      const getActive = computed<Base | null>(() => modelerStore.getActive!)

      // 变量配置部分
      const varVisible = ref<boolean>(false)
      const variableName = ref<string | undefined>(undefined)
      const varEventVisible = ref<boolean>(false)
      const variableEvents = ref<string | undefined>(undefined)
      const getElementVariables = () => {
        varVisible.value = CU.isConditionEventDefinition(getActive.value!)
        variableName.value = CU.getVariableNameValue(getActive.value!)
        if (varVisible.value) {
          varEventVisible.value = !CU.isExtendStartEvent(getActive.value!)
          variableEvents.value = CU.getVariableEventsValue(getActive.value!)
        }
      }
      const setElementVariableName = (value: string | undefined) => {
        CU.setVariableNameValue(getActive.value!, value)
      }
      const setElementVariableEvents = (value: string | undefined) => {
        CU.setVariableEventsValue(getActive.value!, value)
      }

      // 条件类型配置部分
      const conditionTypeOptions = ref<Record<string, string>[]>([])
      const conditionData = ref<ConditionalForm>({})
      const getElementConditionType = () => {
        conditionData.value.conditionType = CU.getConditionTypeValue(getActive.value!)
        conditionData.value.conditionType === 'expression' && getConditionExpression()
        conditionData.value.conditionType === 'script' && getConditionScript()
      }
      const setElementConditionType = (value: string) => {
        CU.setConditionTypeValue(getActive.value!, value)
      }

      const getConditionExpression = () => {
        conditionData.value.expression = CU.getConditionExpressionValue(getActive.value!)
      }
      const setConditionExpression = (value: string | undefined) => {
        CU.setConditionExpressionValue(getActive.value!, value)
      }

      const getConditionScript = () => {
        conditionData.value.language = CU.getConditionScriptLanguageValue(getActive.value!)
        conditionData.value.scriptType = CU.getConditionScriptTypeValue(getActive.value!)
        conditionData.value.body = CU.getConditionScriptBodyValue(getActive.value!)
        conditionData.value.resource = CU.getConditionScriptResourceValue(getActive.value!)
      }
      const setConditionScriptLanguage = (value: string | undefined) => {
        CU.setConditionScriptLanguageValue(getActive.value!, value)
      }
      const setElementConditionScriptType = (value: string | undefined) => {
        CU.setConditionScriptTypeValue(getActive.value!, value)
      }
      const setConditionScriptBody = (value: string | undefined) => {
        CU.setConditionScriptBodyValue(getActive.value!, value)
      }
      const setConditionScriptResource = (value: string | undefined) => {
        CU.setConditionScriptResourceValue(getActive.value!, value)
      }

      onMounted(() => {
        getElementVariables()
        getElementConditionType()
        conditionTypeOptions.value = CU.getConditionTypeOptions(getActive.value!)
        EventEmitter.on('element-update', () => {
          conditionTypeOptions.value = CU.getConditionTypeOptions(getActive.value!)
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
        conditionData,
        scriptTypeOptions,
        setElementConditionType,
        setConditionExpression,
        setConditionScriptLanguage,
        setElementConditionScriptType,
        setConditionScriptBody,
        setConditionScriptResource
      }
    }
  })
</script>
