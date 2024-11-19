<script setup lang="ts">
import { Attachment } from "@xwiki/cristal-attachments-api";

defineProps<{ attachment: Attachment }>();
</script>

<template>
  <object :data="attachment.href" :type="attachment.mimetype"></object>
</template>

<style scoped></style>
