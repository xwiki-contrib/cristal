<script setup lang="ts">
import { NodeViewWrapper } from "@tiptap/vue-3";
import type { NodeViewProps } from "@tiptap/vue-3";
import { computed } from "vue";

const { node } = defineProps<NodeViewProps>();

const src = computed(() => {
  return node.attrs.src;
});

const alt = computed(() => {
  return node.attrs.alt;
});
</script>
<template>
  <node-view-wrapper>
    <img v-if="src" :src="src" :alt="alt" />
    <span v-else>Select or upload an image</span>
  </node-view-wrapper>
</template>

<style scoped>
:global(.tiptap .component-class) {
  border: 1px solid #0f0;
}
</style>
