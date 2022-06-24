<template>
  <n-collapse-item name="element-async-continuations">
    <template #header>
      <collapse-title title="异步属性">
        <lucide-icon name="Shuffle" />
      </collapse-title>
    </template>
    <edit-item label="Before" :label-width="120">
      <n-switch v-model:value="acBefore" @update:value="updateElementACBefore" />
    </edit-item>
    <edit-item label="After" :label-width="120">
      <n-switch v-model:value="acAfter" @update:value="updateElementACAfter" />
    </edit-item>
    <edit-item v-if="showExclusive" label="Exclusive" :label-width="120">
      <n-switch v-model:value="acExclusive" @update:value="updateElementACExclusive" />
    </edit-item>
  </n-collapse-item>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'
  import { mapState } from 'pinia'
  import { Base } from 'diagram-js/lib/model'
  import modelerStore from '@/store/modeler'
  import {
    getACAfter,
    getACBefore,
    getACExclusive,
    setACAfter,
    setACBefore,
    setACExclusive
  } from '@/bo-utils/asynchronousContinuationsUtil'

  export default defineComponent({
    name: 'ElementAsyncContinuations',
    data() {
      return {
        acBefore: false,
        acAfter: false,
        acExclusive: false
      }
    },
    computed: {
      ...mapState(modelerStore, ['getActive', 'getActiveId']),
      showExclusive() {
        return this.acBefore || this.acAfter
      }
    },
    watch: {
      getActiveId: {
        immediate: true,
        handler() {
          this.reloadACStatus()
        }
      }
    },
    methods: {
      reloadACStatus() {
        this.acBefore = getACBefore(this.getActive as Base)
        this.acAfter = getACAfter(this.getActive as Base)
        this.acExclusive = getACExclusive(this.getActive as Base)
      },
      updateElementACBefore(value: boolean) {
        setACBefore(this.getActive as Base, value)
        this.reloadACStatus()
      },
      updateElementACAfter(value: boolean) {
        setACAfter(this.getActive as Base, value)
        this.reloadACStatus()
      },
      updateElementACExclusive(value: boolean) {
        setACExclusive(this.getActive as Base, value)
        this.reloadACStatus()
      }
    }
  })
</script>
