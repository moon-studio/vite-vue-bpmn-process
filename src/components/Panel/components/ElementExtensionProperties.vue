<template>
  <n-collapse-item name="element-extension-properties">
    <template #header>
      <collapse-title :title="$t('panel.extensionProperties')">
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
        <span>{{ $t('panel.addExtensionProperties') }}</span>
      </n-button>
    </div>

    <n-modal
      v-model:show="modelVisible"
      preset="dialog"
      :title="$t('panel.addExtensionProperties')"
      :style="{ width: '640px' }"
    >
      <n-form ref="formRef" :model="newProperty" :rules="rules" aria-modal="true">
        <n-form-item path="name" :label="$t('panel.propertyName')">
          <n-input v-model:value="newProperty.name" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item path="value" :label="$t('panel.propertyValue')">
          <n-input v-model:value="newProperty.value" @keydown.enter.prevent />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button size="small" type="info" @click="addProperty">{{ $t('panel.confirm') }}</n-button>
      </template>
    </n-modal>
  </n-collapse-item>
</template>

<script lang="ts">
  import { h, defineComponent, toRaw, markRaw } from 'vue'
  import { mapState } from 'pinia'
  import modelerStore from '@/store/modeler'
  import { Base } from 'diagram-js/lib/model'
  import {
    addExtensionProperty,
    getExtensionProperties,
    removeExtensionProperty
  } from '@/bo-utils/extensionPropertiesUtil'

  import { FormInst, NButton } from 'naive-ui'
  import EventEmitter from '@/utils/EventEmitter'

  export default defineComponent({
    name: 'ElementExtensionProperties',
    data() {
      return {
        extensions: [],
        extensionsRaw: [],
        newProperty: { name: '', value: '' },
        rules: {
          name: { required: true, message: '属性名称不能为空', trigger: ['blur', 'change'] },
          value: { required: true, message: '属性值不能为空', trigger: ['blur', 'change'] }
        },
        modelVisible: false
      }
    },
    computed: {
      ...mapState(modelerStore, ['getActive', 'getActiveId']),
      columns() {
        return [
          {
            title: this.$t('panel.index'),
            key: 'index',
            render: (a, index) => index + 1,
            width: 60
          },
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
            title: this.$t('panel.operations'),
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
                  default: () => this.$t('panel.remove')
                }
              )
          }
        ]
      }
    },
    watch: {
      getActiveId: {
        immediate: true,
        handler() {
          this.reloadExtensionProperties()
        }
      }
    },
    mounted() {
      this.reloadExtensionProperties()
      EventEmitter.on('element-update', this.reloadExtensionProperties)
    },
    methods: {
      async reloadExtensionProperties() {
        this.modelVisible = false
        await this.$nextTick()
        this.newProperty = { name: '', value: '' }
        ;(this.extensionsRaw as any[]) = markRaw(getExtensionProperties(this.getActive as Base))
        this.extensions = JSON.parse(JSON.stringify(this.extensionsRaw))
      },
      removeProperty(propIndex: number) {
        removeExtensionProperty(this.getActive as Base, this.extensionsRaw[propIndex])
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
