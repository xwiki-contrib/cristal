<script setup lang="ts">
import filesize from "filesize.js";
defineProps<{ size: number }>();
</script>

<template>
  {{ filesize(size) }}
</template>

<style scoped></style>
