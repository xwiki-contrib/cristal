<script setup lang="ts">
import { Attachment } from "@xwiki/cristal-attachments-api";

defineProps<{ attachment: Attachment }>();
</script>

<template>
  <!-- TODO: add a proper alt, the current one is not good for accessibility. -->
  <img :src="attachment.href" :alt="attachment.name" />
</template>

<style scoped></style>
