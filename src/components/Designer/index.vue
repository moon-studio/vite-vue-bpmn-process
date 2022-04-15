<template>
  <div ref="designer" class="process-designer"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import Modeler from "bpmn-js/lib/Modeler";

export default defineComponent({
  name: "Designer",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const designer = ref<HTMLDivElement | null>(null);

    onMounted(() => {
      const modeler = new Modeler({
        container: designer.value,
        keyboard: {
          bindTo: designer.value,
        },
      });

      console.log(modeler);
    });

    return {
      designer,
    };
  },
});
</script>
