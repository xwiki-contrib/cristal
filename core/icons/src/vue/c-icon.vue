<script setup lang="ts">
import "bootstrap-icons/font/bootstrap-icons.css";

defineProps<{
  name: string;
  size: string;
}>();
// TODO: currently names are bound to bootstrap class names. We'll need to add
// an indirection as soon as we want to support several icon sets.
</script>

<template>
  <span :class="`cr-icon bi-${name} ${size}`"></span>
</template>

<style scoped>
span {
  font-size: 1.3rem;
}
span.small {
  font-size: 1rem;
}
</style>
