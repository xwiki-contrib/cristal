<script setup lang="ts">
import { Attachment, AttachmentPreview } from "@xwiki/cristal-attachments-api";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Ref, inject, ref, watch } from "vue";
import type { CristalApp } from "@xwiki/cristal-api";
import filesize from "filesize.js";

const cristal: CristalApp = inject<CristalApp>("cristal")!;

const attachmentPreview = cristal
  .getContainer()
  .get<AttachmentPreview>("AttachmentPreview")!;

const openedDialog: Ref<boolean> = ref(false);

watch(
  () => {
    // Wait for the preview to be loading or with a value before opening the
    // modal.
    return (
      attachmentPreview.loading().value || attachmentPreview.attachment().value
    );
  },
  (open) => {
    if (open) openedDialog.value = true;
  },
);

const attachment: Ref<Attachment> = ref({
  id: "TODO",
  name: "AttachmentName",
  href: "http://test.com",
  mimetype: "application/json",
  author: "Administrator",
  date: new Date(),
  size: 954100000,
});

dayjs.extend(LocalizedFormat);
</script>

<template>
  <!-- TODO: add translation -->
  <x-dialog v-model="openedDialog" title="View Attachment" width="50%">
    <template #activator>
      <!-- No activator, the modal is opened when the user clicks on an attachment link. -->
    </template>
    <template #default>
      <!-- TODO: abstract to allow preview based on the type -->
      <img
        style="max-width: 50%; max-height: 500px"
        src="https://www.guggenheim.org/wp-content/uploads/1916/01/49.1229_ph_web-1.jpg"
      />
      <div>
        <div>Name {{ attachment.name }}</div>
        <div>Posted by {{ attachment.author }}</div>
        <!-- TODO: move to a dedicated core extension "date" -->
        <div>Date {{ dayjs(attachment.date).format("llll") }}</div>
        <!-- TODO: move to a dedicated core extension "filesize" -->
        <div>Size {{ filesize(attachment.size) }}</div>
        <div>Type {{ attachment.mimetype }}</div>
      </div>
      <div>
        <!-- TODO: top-right close button. -->
        <!-- TODO: bottom right close button. -->
        <x-btn>Download</x-btn>
      </div>
    </template>
  </x-dialog>
</template>

<style scoped></style>
