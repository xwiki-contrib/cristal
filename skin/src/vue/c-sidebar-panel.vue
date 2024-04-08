<script setup lang="ts">
import { CIcon } from "@cristal/icons";

defineProps(['name'])
</script>
<template>
  <div class="c-sidebar-panel">
    <div class="header">
      <span class="title">{{ name }}</span>
      <c-icon name="list-nested" size="small"></c-icon>
    </div>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>
<style scoped>
.header {
  display: flex;
  flex-flow: row;
}
.title {
  color: var(--cr-color-neutral-500);
  font-size: var(--cr-font-size-small);
  font-weight: var(--cr-font-weight-semibold);
  margin-right: auto;
}
</style>
