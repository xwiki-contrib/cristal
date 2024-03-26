<script setup lang="ts">
import CTemplate from "./c-template.vue";
import logo from "../images/logo-x.png";
</script>

<template>
  <x-dialog width="auto" :logo="logo" title="Configuration">
    <template #activator="{ props }">
      <x-img :width="50" :src="logo" v-bind="props" />
    </template>
    <template #default>
      <CTemplate name="config" />
    </template>
  </x-dialog>
</template>

<style scoped></style>
