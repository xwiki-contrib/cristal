<script setup lang="ts">
import { Attachment } from "@xwiki/cristal-attachments-api";

defineProps<{ attachment: Attachment }>();
</script>

<template>
  <object
    :data="attachment.href"
    :type="attachment.mimetype"
    :title="attachment.name"
  >
    Unable to preview {{ attachment.name }}.
  </object>
</template>

<style scoped></style>
