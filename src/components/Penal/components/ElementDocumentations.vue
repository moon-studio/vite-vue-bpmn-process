<template>
  <n-collapse-item name="element-documentations">
    <template #header>
      <collapse-title title="附加文档">
        <lucide-icon name="FileText" />
      </collapse-title>
    </template>
    <edit-item label="Documentation" :label-width="120">
      <n-input v-model:value="elementDoc" type="textarea" @change="updateElementDoc" />
    </edit-item>
  </n-collapse-item>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { mapState } from 'pinia'
  import modelerStore from '@/store/modeler'
  import { Base } from 'diagram-js/lib/model'
  import { getDocumentValue, setDocumentValue } from '@/bo-utils/documentationUtil'

  export default defineComponent({
    name: 'ElementDocumentations',
    data() {
      return {
        elementDoc: ''
      }
    },
    computed: {
      ...mapState(modelerStore, ['getActive', 'getActiveId'])
    },
    watch: {
      getActiveId: {
        immediate: true,
        handler() {
          this.elementDoc = getDocumentValue(this.getActive as Base) || ''
        }
      }
    },
    methods: {
      updateElementDoc(value) {
        setDocumentValue(this.getActive as Base, value)
      }
    }
  })
</script>
