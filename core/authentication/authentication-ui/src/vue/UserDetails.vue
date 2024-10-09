<script setup lang="ts">
import { inject } from "vue";
import { CristalApp } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";

const cristal = inject<CristalApp>("cristal")!;

const authenticationManager = cristal
  .getContainer()
  .get<AuthenticationManagerProvider>("AuthenticationManagerProvider")
  .get()!;

const { profile, name } = await authenticationManager.getUserDetails();
</script>

<template>
  <!-- TODO: localize this string. -->

  You are logged in as <a :href="profile">{{ name }}</a>

  <!-- TODO: -->
  <x-btn variant="danger">Logout</x-btn>
</template>

<style scoped></style>
