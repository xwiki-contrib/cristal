<script setup lang="ts">
import { CIcon } from "@xwiki/cristal-icons";
import UserDetails from "./UserDetails.vue";
import { useI18n } from "vue-i18n";
import messages from "../translations";

const { t } = useI18n({
  messages,
});
</script>

<template>
  <x-dialog width="auto" :title="t('loggedInUserModal.title')">
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
