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
    if (open) {
      openedDialog.value = true;
    }
  },
);

const attachment: Ref<Attachment> = ref({
  id: "TODO",
  name: "mondrian.jpg",
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
  <x-dialog v-model="openedDialog" title="View Attachment">
    <template #activator>
      <!-- No activator, the modal is opened when the user clicks on an attachment link. -->
    </template>
    <template #default>
      <div class="dialog_content">
        <!-- TODO: abstract to allow preview based on the type -->
        <div class="attachment_view">
          <!-- TODO: add an alt value for accessibility. -->
          <img
            src="https://www.guggenheim.org/wp-content/uploads/1916/01/49.1229_ph_web-1.jpg"
          />
        </div>
        <div class="metadata">
          <!-- TODO make a component with key:value -->
          <div class="label_description">
            <div>
              <span class="label">Name</span>
              <span class="description"> {{ attachment.name }}</span>
            </div>
          </div>
          <div class="label_description">
            <div>
              <span class="label">Posted by</span>
              <span class="description"> {{ attachment.author }}</span>
            </div>
          </div>
          <!-- TODO: move to a dedicated core extension "date" -->
          <div class="label_description">
            <div>
              <span class="label">Date</span>
              <span class="description">
                {{ dayjs(attachment.date).format("llll") }}</span
              >
            </div>
          </div>
          <div class="label_description">
            <!-- TODO: move to a dedicated core extension "filesize" -->
            <div class="label_description">
              <div>
                <span class="label">Size</span>
                <span class="description">
                  {{ filesize(attachment.size) }}</span
                >
              </div>
            </div>
          </div>
          <div class="label_description">
            <div>
              <span class="label">Type </span>
              <span class="description"> {{ attachment.mimetype }}</span>
            </div>
            <div class="label_description"></div>
          </div>
        </div>
        <div class="actions">
          <!-- TODO: top-right close button. -->
          <!-- TODO: bottom right close button. -->
          <div class="main_action">
            <x-btn>Another button</x-btn>
            <x-btn>Download</x-btn>
          </div>
          <div class="close_container">
            <x-btn class="close" variant="primary">Close</x-btn>
          </div>
        </div>
      </div>
    </template>
  </x-dialog>
</template>

<style scoped>
.dialog_content {
  display: grid;
  max-height: 80vh;
  grid-auto-flow: column;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;
  gap: 16px 16px;
  grid-template-areas:
    "attachment_view metadata"
    "actions actions";
}

.metadata {
  grid-area: metadata;
  display: flex;
  flex-flow: column;
  gap: 8px;
}
.actions {
  grid-area: actions;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--cr-spacing-medium);
  .main_action {
    display: flex;
    gap: var(--cr-spacing-medium);
  }
  .close_container {
    justify-self: end;
  }
}
.attachment_view {
  grid-area: attachment_view;
  overflow: scroll;
}
.label_description {
  display: flex;
  flex-flow: column;
  gap: 4px;
  .label {
    display: block;
  }
  .description {
    font-weight: var(--cr-font-weight-bold);
  }
}
</style>
