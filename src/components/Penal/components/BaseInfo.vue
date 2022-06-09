<template>
  <n-collapse-item title="基础信息" name="base-info">
    <p>ID: {{ elementId }}</p>
    <p>Name: {{ elementName }}</p>
  </n-collapse-item>
</template>

<script lang="ts">
  import { mapState } from 'pinia'
  import modelerStore from '@/store/modeler'
  import { defineComponent } from 'vue'
  import { NCollapseItem } from 'naive-ui'

  export default defineComponent({
    name: 'BaseInfo',
    components: { NCollapseItem },
    data() {
      return {
        elementId: '',
        elementName: ''
      }
    },
    computed: {
      ...mapState(modelerStore, [
        'getModeler',
        'getModeling',
        'getCanvas',
        'getActive',
        'getActiveId'
      ])
    },
    watch: {
      getActiveId: {
        immediate: true,
        handler() {
          this.elementId = this.getActiveId as string
          this.elementName = this.getActive?.businessObject.name
        }
      }
    },
    mounted() {},
    methods: {}
  })
</script>
