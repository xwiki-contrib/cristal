<script setup lang="ts">
import { CIcon } from "@xwiki/cristal-icons";
import UserDetails from "./UserDetails.vue";
</script>

<template>
  <!-- TODO: translate-->
  <x-dialog width="auto" title="Account">
    <template #activator="{ props }">
      <x-btn variant="primary">
        <c-icon name="person" v-bind="props"></c-icon>
      </x-btn>
    </template>
    <template #default>
      <suspense>
        <user-details></user-details>
      </suspense>
    </template>
  </x-dialog>
</template>

<style scoped></style>
