<script setup lang="ts">
import { Attachment } from "@xwiki/cristal-attachments-api";

defineProps<{ attachment: Attachment }>();
</script>

<template>
  <video controls width="250">
    <source :src="attachment.href" :type="attachment.mimetype" />
    <!-- TODO: translate -->
    Download the <a :href="attachment.href">{{ attachment.name }}</a> video.
  </video>
</template>

<style scoped></style>
