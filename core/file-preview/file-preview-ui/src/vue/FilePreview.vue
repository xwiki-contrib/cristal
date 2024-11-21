<script setup lang="ts">
import NoPreview from "./NoPreview.vue";
import ImageFilePreview from "./preview/ImageFilePreview.vue";
import VideoFilePreview from "./preview/VideoFilePreview.vue";
import { Attachment } from "@xwiki/cristal-attachments-api";
import type { Component } from "vue";

defineProps<{ attachment: Attachment }>();
type AttachmentsMap = {
  [key: string]: { component: Component; regex: RegExp };
};
// TODO: to be moved to a component base approach.
const attachmentsMap: AttachmentsMap = {
  image: { component: ImageFilePreview, regex: /image\/.*/ },
  // TODO: pdf preview is currently disabled as it does not work on Chrome and Electron.
  // application: { component: ApplicationFilePreview, regex: /application\/pdf/ },
  video: { component: VideoFilePreview, regex: /video\/.*/ },
};

function resolve(mimetype: string): Component {
  for (const key in attachmentsMap) {
    const { component, regex } = attachmentsMap[key];
    if (mimetype.match(regex)) {
      return component;
    }
  }
  return NoPreview;
}
</script>

<template>
  <component
    :is="resolve(attachment.mimetype)"
    v-bind="{ attachment }"
  ></component>
</template>

<style scoped></style>
