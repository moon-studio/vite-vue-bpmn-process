<template>
  <n-collapse-item name="element-extension-properties">
    <template #header>
      <collapse-title title="扩展属性">
        <lucide-icon name="FileCog" />
      </collapse-title>
    </template>
    <template #header-extra>
      <n-tag type="primary" round>
        {{ extensions.length }}
      </n-tag>
    </template>
    <div class="element-extension-properties">
      <n-data-table size="small" max-height="20vh" :columns="columns" :data="extensions" />

      <n-button type="info" class="inline-large-button" secondary @click="openPropertyModel">
        <lucide-icon :size="20" name="Plus" />
        <span>添加扩展属性</span>
      </n-button>
    </div>

    <n-modal
      v-model:show="modelVisible"
      preset="dialog"
      title="添加扩展属性"
      :style="{ width: '480px' }"
    >
      <n-form ref="formRef" :model="newProperty" :rules="rules" aria-modal="true">
        <n-form-item path="name" label="Name">
          <n-input v-model:value="newProperty.name" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item path="value" label="Value">
          <n-input v-model:value="newProperty.value" @keydown.enter.prevent />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button size="small" type="info" @click="addProperty">确认</n-button>
      </template>
    </n-modal>
  </n-collapse-item>
</template>

<script lang="ts">
  import { h, defineComponent, toRaw } from 'vue'
  import CollapseTitle from '@/components/common/CollapseTitle.vue'
  import LucideIcon from '@/components/common/LucideIcon.vue'
  import { mapState } from 'pinia'
  import modelerStore from '@/store/modeler'
  import { Base } from 'diagram-js/lib/model'
  import {
    addExtensionProperty,
    getExtensionProperties,
    removeExtensionProperty
  } from '@/bo-utils/extensionElementsUtil'

  import { FormInst, NButton } from 'naive-ui'

  export default defineComponent({
    name: 'ElementExtensionProperties',
    components: { LucideIcon, CollapseTitle },
    data() {
      return {
        columns: [
          { title: '序号', key: 'index', render: (a, index) => index + 1, width: 50 },
          {
            title: 'Name',
            key: 'name',
            ellipsis: {
              tooltip: true
            }
          },
          {
            title: 'Value',
            key: 'value',
            ellipsis: {
              tooltip: true
            }
          },
          {
            title: '操作',
            key: 'operation',
            width: 80,
            align: 'center',
            render: (row, index) =>
              h(
                NButton,
                {
                  quaternary: true,
                  size: 'small',
                  type: 'error',
                  onClick: () => this.removeProperty(index)
                },
                {
                  default: () => '移除'
                }
              )
          }
        ],
        extensions: [],
        newProperty: { name: '', value: '' },
        rules: {
          name: { required: true, message: 'Name 不能为空', trigger: ['blur', 'change'] },
          value: { required: true, message: 'Value 不能为空', trigger: ['blur', 'change'] }
        },
        modelVisible: false
      }
    },
    computed: {
      ...mapState(modelerStore, ['getActive', 'getActiveId'])
    },
    watch: {
      getActiveId: {
        immediate: true,
        handler() {
          this.reloadExtensionProperties()
        }
      }
    },
    methods: {
      async reloadExtensionProperties() {
        this.modelVisible = false
        await this.$nextTick()
        this.newProperty = { name: '', value: '' }
        this.extensions = JSON.parse(JSON.stringify(getExtensionProperties(this.getActive as Base)))
      },
      removeProperty(propIndex: number) {
        removeExtensionProperty(this.getActive as Base, propIndex)
        this.reloadExtensionProperties()
      },
      async addProperty() {
        ;(this.$refs.formRef as FormInst).validate((errors) => {
          if (!errors) {
            addExtensionProperty(this.getActive as Base, toRaw(this.newProperty))
            this.reloadExtensionProperties()
          }
        })
      },
      async openPropertyModel() {
        this.modelVisible = true
        await this.$nextTick()
        ;(this.$refs.formRef as FormInst).restoreValidation()
      }
    }
  })
</script>

<style scoped></style>
