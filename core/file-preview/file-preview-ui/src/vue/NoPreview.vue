<script setup lang="ts">
import messages from "../translations";
import { useI18n } from "vue-i18n";

const { t } = useI18n({
  messages,
});
</script>

<template>
  {{ t("No preview available") }}
</template>

<style scoped></style>
