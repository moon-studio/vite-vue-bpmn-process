<template>
  <n-collapse-item name="element-execution-listeners">
    <template #header>
      <collapse-title title="执行监听">
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

      <n-button type="info" class="inline-large-button" secondary @click="openListenerModel">
        <lucide-icon :size="20" name="Plus" />
        <span>添加执行监听</span>
      </n-button>
    </div>

    <n-modal
      v-model:show="modelVisible"
      preset="dialog"
      title="添加扩展属性"
      :style="{ width: '480px' }"
    >
      <n-form ref="formRef" :model="newListener" :rules="rules" aria-modal="true">
        <n-form-item path="event" label="Event">
          <n-input v-model:value="newListener.event" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item path="class" label="Class">
          <n-input v-model:value="newListener.class" @keydown.enter.prevent />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button size="small" type="info" @click="addExecutionListener">确认</n-button>
      </template>
    </n-modal>
  </n-collapse-item>
</template>

<script lang="ts">
  import { defineComponent, h, markRaw, ref, reactive } from 'vue'
  import { NButton } from 'naive-ui'
  import { mapState } from 'pinia'
  import modelerStore from '@/store/modeler'
  import { Base, ModdleElement } from 'diagram-js/lib/model'
  import {
    getExecutionListeners,
    getExecutionListenerType,
    removeExecutionListener
  } from '@/bo-utils/executionListenersUtil'

  export default defineComponent({
    name: 'ElementExecutionListeners',
    setup() {
      const modelVisible = ref(false)
      const listeners = ref<BpmnExecutionListener[]>([])
      const newListener = ref<BpmnExecutionListener>({ event: '' })

      return {
        modelVisible,
        listeners,
        newListener
      }
    },
    data() {
      return {
        columns: [
          { title: '序号', key: 'index', render: (a, index) => index + 1, width: 50 },
          { title: 'EventType', key: 'event', ellipsis: { tooltip: true } },
          { title: 'ListenerType', key: 'type', ellipsis: { tooltip: true } },
          {
            title: '操作',
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
                    onClick: () => this.openListenerModel(row)
                  },
                  { default: () => '编辑' }
                ),
                h(
                  NButton,
                  {
                    quaternary: true,
                    size: 'small',
                    type: 'error',
                    onClick: () => this.removeListener(index)
                  },
                  { default: () => '移除' }
                )
              ])
          }
        ],
        listenersRaw: [],
        rules: {}
      }
    },
    computed: {
      ...mapState(modelerStore, ['getActive', 'getActiveId'])
    },
    watch: {
      getActiveId: {
        immediate: true,
        handler() {
          this.reloadExtensionListeners()
        }
      }
    },
    methods: {
      reloadExtensionListeners() {
        ;(this.listenersRaw as ModdleElement[]) = markRaw(
          getExecutionListeners(this.getActive as Base)
        )
        this.listeners = JSON.parse(
          JSON.stringify(
            this.listenersRaw.map((listener: ModdleElement) => ({
              ...listener,
              type: getExecutionListenerType(listener)
            }))
          )
        )
      },
      removeListener(index: number) {
        const listener = this.listenersRaw[index]
        removeExecutionListener(this.getActive as Base, listener)
        this.reloadExtensionListeners()
      },
      addExecutionListener() {},
      openListenerModel() {}
    }
  })
</script>

<style scoped></style>
