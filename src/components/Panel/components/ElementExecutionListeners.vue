<template>
  <n-collapse-item name="element-execution-listeners">
    <template #header>
      <collapse-title :title="$t('panel.executionListeners')">
        <lucide-icon name="Radio" />
      </collapse-title>
    </template>
    <template #header-extra>
      <n-tag type="primary" round>
        {{ listeners.length }}
      </n-tag>
    </template>
    <div class="element-extension-listeners">
      <n-data-table size="small" max-height="20vh" :columns="columns" :data="listeners" />

      <n-button type="info" class="inline-large-button" secondary @click="openListenerModel(-1)">
        <lucide-icon :size="20" name="Plus" />
        <span>{{ $t('panel.addExecutionListener') }}</span>
      </n-button>
    </div>

    <n-modal
      v-model:show="modelVisible"
      preset="dialog"
      :title="$t('panel.addExecutionListener')"
      :style="{ width: '640px' }"
    >
      <n-form
        ref="formRef"
        :model="newListener"
        :rules="formRules"
        class="need-filled"
        aria-modal="true"
      >
        <n-form-item path="event" :label="$t('panel.executionListenerEventType')">
          <n-select v-model:value="newListener.event" :options="listenerEventTypeOptions" />
        </n-form-item>
        <n-form-item path="type" :label="$t('panel.executionListenerType')">
          <n-select
            v-model:value="newListener.type"
            :options="listenerTypeOptions"
            @update:value="updateListenerType"
          />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'class'"
          path="class"
          :label="$t('panel.javaClass')"
        >
          <n-input v-model:value="newListener.class" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'expression'"
          path="expression"
          :label="$t('panel.expression')"
        >
          <n-input v-model:value="newListener.expression" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item
          v-if="formItemVisible.listenerType === 'delegateExpression'"
          path="delegateExpression"
          :label="$t('panel.delegateExpression')"
        >
          <n-input v-model:value="newListener.delegateExpression" @keydown.enter.prevent />
        </n-form-item>
        <template v-if="formItemVisible.listenerType === 'script' && newListener.script">
          <n-form-item
            key="scriptFormat"
            path="script.scriptFormat"
            :label="$t('panel.scriptFormat')"
          >
            <n-input v-model:value="newListener.script.scriptFormat" @keydown.enter.prevent />
          </n-form-item>
          <n-form-item key="scriptType" path="script.scriptType" :label="$t('panel.scriptType')">
            <n-select
              v-model:value="newListener.script.scriptType"
              :options="scriptTypeOptions"
              @update:value="updateScriptType"
            />
          </n-form-item>
          <n-form-item
            v-if="formItemVisible.scriptType === 'inline'"
            key="scriptContent"
            path="script.value"
            :label="$t('panel.scriptBody')"
          >
            <n-input
              v-model:value="newListener.script.value"
              type="textarea"
              @keydown.enter.prevent
            />
          </n-form-item>
          <n-form-item
            v-if="formItemVisible.scriptType === 'external'"
            key="scriptResource"
            path="script.resource"
            :label="$t('panel.scriptResource')"
          >
            <n-input v-model:value="newListener.script.resource" @keydown.enter.prevent />
          </n-form-item>
        </template>
      </n-form>
      <template #action>
        <n-button size="small" type="info" @click="saveExecutionListener">{{
          $t('panel.confirm')
        }}</n-button>
      </template>
    </n-modal>
  </n-collapse-item>
</template>

<script lang="ts">
  import { defineComponent, h, markRaw, ref, computed, nextTick, onMounted, ComputedRef } from 'vue'
  import { FormInst, FormRules, DataTableColumns, NButton } from 'naive-ui'
  import modeler from '@/store/modeler'
  import { ModdleElement } from 'bpmn-moddle'
  import { Base } from 'diagram-js/lib/model'
  import {
    addExecutionListener,
    getDefaultEvent,
    getExecutionListeners,
    getExecutionListenerType,
    getExecutionListenerTypes,
    removeExecutionListener,
    updateExecutionListener
  } from '@/bo-utils/executionListenersUtil'
  import { getScriptType } from '@/bo-utils/scriptUtil'
  import EventEmitter from '@/utils/EventEmitter'
  import { useI18n } from 'vue-i18n'

  export default defineComponent({
    name: 'ElementExecutionListeners',
    setup() {
      const { t } = useI18n()
      const modelerStore = modeler()
      const getActive = computed(() => modelerStore.getActive!)
      const getActiveId = computed<string>(() => modelerStore.getActiveId!)
      let listenersRaw = markRaw([])
      let activeIndex = -1

      const modelVisible = ref(false)
      const listeners = ref<ExecutionListenerForm[]>([])
      const newListener = ref<ExecutionListenerForm>({ event: '', type: 'class' })
      const formRef = ref<FormInst | null>(null)
      const formItemVisible = ref<FormItemVisible>({
        listenerType: 'class',
        scriptType: 'none'
      })

      const listenerEventTypeOptions = ref<Record<string, string>[]>([
        { label: 'Start', value: 'start' },
        { label: 'End', value: 'end' },
        { label: 'Take', value: 'take' }
      ])
      const listenerTypeOptions = ref<Record<string, string>[]>([
        { label: 'Java Class', value: 'class' },
        { label: 'Expression', value: 'expression' },
        { label: 'DelegateExpression', value: 'delegateExpression' },
        { label: 'Script', value: 'script' }
      ])
      const scriptTypeOptions = ref<Record<string, string>[]>([
        { label: 'External Resource', value: 'external' },
        { label: 'Inline Script', value: 'inline' },
        { label: 'None', value: 'none' }
      ])
      const formRules: FormRules = {
        event: { required: true, trigger: ['blur', 'change'], message: '事件类型不能为空' },
        type: { required: true, trigger: ['blur', 'change'], message: '监听器类型不能为空' }
      }
      const columns: ComputedRef<DataTableColumns<ExecutionListenerForm>> = computed(() => [
        { title: t('panel.index'), key: 'index', render: (a, index) => index + 1, width: 60 },
        { title: 'EventType', key: 'event', ellipsis: { tooltip: true } },
        { title: 'ListenerType', key: 'type', ellipsis: { tooltip: true } },
        {
          title: t('panel.operations'),
          key: 'operation',
          width: 140,
          align: 'center',
          render: (row, index) =>
            h('span', {}, [
              h(
                NButton,
                {
                  quaternary: true,
                  size: 'small',
                  type: 'info',
                  onClick: () => openListenerModel(index, row)
                },
                { default: () => t('panel.edit') }
              ),
              h(
                NButton,
                {
                  quaternary: true,
                  size: 'small',
                  type: 'error',
                  onClick: () => removeListener(index)
                },
                { default: () => t('panel.remove') }
              )
            ])
        }
      ])

      const updateListenerType = (value: string) => {
        formItemVisible.value.listenerType = value
        newListener.value = {
          ...newListener.value,
          type: value,
          ...(value === 'script' ? { script: newListener.value.script || {} } : {})
        }
      }
      const updateScriptType = (value: string) => {
        formItemVisible.value.scriptType = value
        newListener.value.script = {
          scriptFormat: newListener.value.script?.scriptFormat,
          scriptType: value
        }
      }

      const reloadExtensionListeners = () => {
        modelVisible.value = false
        updateListenerType('class')
        newListener.value = { event: getDefaultEvent(getActive.value), type: 'class' }
        listenerEventTypeOptions.value = getExecutionListenerTypes(getActive.value)
        ;(listenersRaw as ModdleElement[]) = markRaw(getExecutionListeners(getActive.value as Base))
        const list = listenersRaw.map(
          (item: ModdleElement & BpmnExecutionListener): ExecutionListenerForm => ({
            ...item,
            ...(item.script
              ? {
                  script: {
                    ...item.script,
                    scriptType: getScriptType(item.script as ModdleElement & BpmnScript)
                  }
                }
              : {}),
            type: getExecutionListenerType(item)
          })
        )
        listeners.value = JSON.parse(JSON.stringify(list))
      }

      const removeListener = (index: number) => {
        const listener: ModdleElement = listenersRaw[index]
        removeExecutionListener(getActive.value, listener)
        reloadExtensionListeners()
      }

      const saveExecutionListener = async () => {
        await formRef.value!.validate()
        activeIndex === -1
          ? addExecutionListener(getActive.value, newListener.value)
          : updateExecutionListener(getActive.value, newListener.value, listenersRaw[activeIndex])
        reloadExtensionListeners()
      }

      const openListenerModel = async (index: number, listenerData?: ExecutionListenerForm) => {
        activeIndex = index
        console.log(JSON.stringify(listenerData))
        listenerData && (newListener.value = JSON.parse(JSON.stringify(listenerData)))
        updateListenerType(listenerData?.type || 'class')
        modelVisible.value = true
        await nextTick()
        formRef.value && formRef.value.restoreValidation()
      }

      onMounted(() => {
        reloadExtensionListeners()
        EventEmitter.on('element-update', reloadExtensionListeners)
      })

      return {
        modelVisible,
        getActiveId,
        getActive,
        formRef,
        listeners,
        newListener,
        formRules,
        columns,
        formItemVisible,
        listenerEventTypeOptions,
        listenerTypeOptions,
        scriptTypeOptions,
        removeListener,
        saveExecutionListener,
        openListenerModel,
        updateListenerType,
        updateScriptType
      }
    }
  })
</script>
