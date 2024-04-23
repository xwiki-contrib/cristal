<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import "tippy.js/dist/tippy.css";

import tippy, { Instance, Props } from "tippy.js";

const container = ref();

const props = defineProps<{
  clientRect: any;
}>();

console.log("clientRect", props.clientRect);

let popup: Instance<Props>[];

onMounted(() => {
  popup = tippy("body", {
    getReferenceClientRect: props.clientRect,
    appendTo: () => document.body,
    content: container.value,
    showOnCreate: true,
    interactive: true,
    trigger: "manual",
    placement: "bottom-start",
  });
});

onUnmounted(() => {
  popup[0].destroy();
});
</script>

<template>
  <div ref="container">
    <div>
      <button>B1</button>
    </div>
  </div>
</template>

<style scoped></style>
