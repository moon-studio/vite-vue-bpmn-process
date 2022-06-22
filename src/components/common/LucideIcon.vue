<template>
  <component :is="icon" v-bind="$props" />
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue'
  import * as icons from 'lucide-vue-next'

  export default defineComponent({
    name: 'LucideIcon',
    props: {
      name: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        default: 16
      },
      color: {
        type: String,
        default: 'currentColor'
      },
      strokeWidth: {
        type: Number,
        default: 2
      },
      defaultClass: {
        type: String,
        default: 'lucide-icon'
      }
    },
    setup(props) {
      const icon = computed(() => icons[props.name])

      return { icon }
    }
  })
</script>
