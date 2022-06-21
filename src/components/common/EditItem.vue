<template>
  <div class="edit-item">
    <div class="edit-item_label" :style="labelStyle">{{ label }}：</div>
    <div class="edit-item_content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue'

  export default defineComponent({
    name: 'EditItem',
    props: {
      label: {
        type: String,
        default: ''
      },
      textAlign: {
        type: String,
        default: 'right',
        validator: (val: string) => ['left', 'center', 'right'].includes(val)
      },
      labelWidth: {
        type: Number,
        default: 80
      }
    },
    computed: {
      labelStyle() {
        return {
          width: `${this.labelWidth}px`,
          textAlign: this.textAlign as 'center'
        }
      }
    }
  })
</script>

<style scoped lang="scss">
  .edit-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    line-height: 34px;
    .edit-item_content {
      flex: 1;
    }

    & + .edit-item {
      margin-top: 12px;
    }
  }
</style>
