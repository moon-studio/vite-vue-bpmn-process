<template>
  <n-collapse-item name="element-documentations">
    <template #header>
      <collapse-title :title="$t('panel.documentationSettings')">
        <lucide-icon name="FileText" />
      </collapse-title>
    </template>
    <edit-item :label="$t('panel.documentationBody')" :label-width="120">
      <n-input v-model:value="elementDoc" type="textarea" @change="updateElementDoc" />
    </edit-item>
  </n-collapse-item>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { mapState } from 'pinia'
  import modelerStore from '@/store/modeler'
  import { Element } from 'diagram-js/lib/model/Types'
  import { getDocumentValue, setDocumentValue } from '@/bo-utils/documentationUtil'
  import EventEmitter from '@/utils/EventEmitter'

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
          this.elementDoc = getDocumentValue(this.getActive as Element) || ''
        }
      }
    },
    mounted() {
      this.elementDoc = getDocumentValue(this.getActive as Element) || ''
      EventEmitter.on('element-update', () => {
        this.elementDoc = getDocumentValue(this.getActive as Element) || ''
      })
    },
    methods: {
      updateElementDoc(value) {
        setDocumentValue(this.getActive as Element, value)
      }
    }
  })
</script>
