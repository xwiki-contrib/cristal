<script setup lang="ts">
import { CIcon } from "@cristal/icons";
</script>
<template>
  <div class="c-sidebar-panel">
    <div class="header">
      <span class="title">Panel Title</span>
      <c-icon name="list-nested" size="small"></c-icon>
    </div>
    <div class="content">panel content</div>
  </div>
</template>
<style scoped>
.c-sidebar-panel {
  border: 1px solid black;
}
.header {
  display: flex;
  flex-flow: row;
}
.title {
  margin-right: auto;
}
</style>
