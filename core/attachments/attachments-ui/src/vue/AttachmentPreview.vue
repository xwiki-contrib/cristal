<script setup lang="ts">
import { Attachment, AttachmentPreview } from "@xwiki/cristal-attachments-api";
import { FilePreview } from "@xwiki/cristal-file-preview-ui";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import filesize from "filesize.js";
import { Ref, inject, ref, watch } from "vue";
import type { CristalApp } from "@xwiki/cristal-api";
import { User } from "@xwiki/cristal-user-ui";

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

function close() {
  openedDialog.value = false;
}

function download() {
  // TODO: resolve url and oen to download
  // TODO: make sure this is also working with electron somehow
  const value = attachment.value;
  if (value) {
    window.location.href = value.href;
  }
}

const attachment: Ref<Attachment | undefined> = attachmentPreview.attachment();

const loading = attachmentPreview.loading();
const error = attachmentPreview.error();

dayjs.extend(LocalizedFormat);
</script>

<template>
  <!-- TODO: add translation -->
  <x-dialog v-model="openedDialog" title="View Attachment">
    <template #activator>
      <!-- No activator, the modal is opened when the user clicks on an attachment link. -->
    </template>
    <template #default>
      <div v-if="loading">Loading...</div>
      <!-- TODO add an error div -->
      <div v-else-if="attachment" class="dialog_content">
        <!-- TODO: abstract to allow preview based on the type -->
        <div class="attachment_view">
          <div class="attachment_view_inner">
            <file-preview :attachment="attachment" />
          </div>
        </div>
        <div class="metadata">
          <!-- TODO make a component with key:value -->
          <div class="label_description">
            <div>
              <span class="label">Name</span>
              <span class="description">{{ attachment.name }}</span>
            </div>
          </div>
          <div v-if="attachment.author" class="label_description">
            <div>
              <span class="label">Posted by</span>
              <!-- TODO: extra an user module -->
              <span class="description">
                <user :user="attachment.author" />
              </span>
            </div>
          </div>

          <div class="label_description">
            <div>
              <span class="label">Date</span>
              <span class="description">
                <!-- TODO: move to a dedicated core extension "date" -->
                {{ dayjs(attachment.date).format("llll") }}
              </span>
            </div>
          </div>
          <div class="label_description">
            <!-- TODO: move to a dedicated core extension "filesize" -->
            <div class="label_description">
              <div>
                <span class="label">Size</span>
                <span class="description">
                  {{ filesize(attachment.size) }}
                </span>
              </div>
            </div>
          </div>
          <div class="label_description">
            <div>
              <span class="label">Type</span>
              <span class="description">{{ attachment.mimetype }}</span>
            </div>
            <div class="label_description"></div>
          </div>
        </div>
        <div class="actions">
          <!-- TODO: top-right close button. -->
          <!-- TODO: bottom right close button. -->
          <div class="main_action">
            <x-btn @click="download()">Download</x-btn>
          </div>
          <div class="close_container">
            <x-btn class="close" variant="primary" @click="close()">
              Close
            </x-btn>
          </div>
        </div>
      </div>
      <div v-else>
        <div v-if="error">{{ error }}</div>
        <div v-else>Unknown error message</div>
      </div>
    </template>
  </x-dialog>
</template>

<style scoped>
.dialog_content {
  display: grid;
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

.attachment_view img {
  max-height: 70vh;
  display: block;
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
