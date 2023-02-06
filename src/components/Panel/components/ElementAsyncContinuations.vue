<template>
  <n-collapse-item name="element-async-continuations">
    <template #header>
      <collapse-title :title="$t('panel.asyncContinuations')">
        <lucide-icon name="Shuffle" />
      </collapse-title>
    </template>
    <edit-item :label="$t('panel.asyncBefore')" :label-width="120">
      <n-switch v-model:value="acBefore" @update:value="updateElementACBefore" />
    </edit-item>
    <edit-item :label="$t('panel.asyncAfter')" :label-width="120">
      <n-switch v-model:value="acAfter" @update:value="updateElementACAfter" />
    </edit-item>
    <edit-item v-if="showExclusive" :label="$t('panel.asyncExclusive')" :label-width="120">
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
  import EventEmitter from '@/utils/EventEmitter'

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
    mounted() {
      this.reloadACStatus()
      EventEmitter.on('element-update', this.reloadACStatus)
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
