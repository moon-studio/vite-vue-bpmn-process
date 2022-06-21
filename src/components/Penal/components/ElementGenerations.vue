<template>
  <n-collapse-item name="base-info">
    <template #header>
      <collapse-title title="常规信息">
        <n-icon :component="InfoOutlined" />
      </collapse-title>
    </template>

    <edit-item label="ID">
      <n-input v-model:value="elementId" maxlength="32" @change="updateElementId" />
    </edit-item>

    <edit-item label="Name">
      <n-input v-model:value="elementName" maxlength="20" @change="updateElementName" />
    </edit-item>
  </n-collapse-item>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { mapState } from 'pinia'
  import { NCollapseItem, NIcon, NInput } from 'naive-ui'
  import InfoOutlined from '@vicons/material/InfoOutlined'
  import modelerStore from '@/store/modeler'
  import CollapseTitle from '@/components/common/CollapseTitle.vue'
  import EditItem from '@/components/common/EditItem.vue'
  import { Base } from 'diagram-js/lib/model'
  import { getNameValue, setNameValue } from '@/bo-utils/nameProps'
  import { setIdValue } from '@/bo-utils/idProps'

  export default defineComponent({
    name: 'ElementGenerations',
    components: { EditItem, CollapseTitle, NCollapseItem, NIcon, NInput },
    setup() {
      return { InfoOutlined }
    },
    data() {
      return {
        elementId: '',
        elementName: ''
      }
    },
    computed: {
      ...mapState(modelerStore, ['getActive', 'getActiveId'])
    },
    watch: {
      getActiveId: {
        immediate: true,
        handler() {
          this.elementId = this.getActiveId as string
          this.elementName = getNameValue(this.getActive as Base) || ''
        }
      }
    },
    mounted() {},
    methods: {
      updateElementName(value: string) {
        setNameValue(this.getActive as Base, value)
      },
      updateElementId(value: string) {
        setIdValue(this.getActive as Base, value)
      }
    }
  })
</script>
