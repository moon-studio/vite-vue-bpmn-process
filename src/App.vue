<template>
  <div class="bpmn-process-container">
    <designer />
  </div>
</template>

<script setup lang="ts">
import Designer from "@/components/Designer/index.vue";
</script>

<style>
body,
html,
.bpmn-process-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
}
</style>
