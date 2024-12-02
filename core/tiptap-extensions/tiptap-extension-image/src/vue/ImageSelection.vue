<script lang="ts" setup>
import { Attachment } from "@xwiki/cristal-attachments-api";
import { inject, ref } from "vue";

const openedDialog = ref(false);

function show() {
  openedDialog.value = true;
}

function hide() {
  openedDialog.value = false;
}

defineExpose({
  show,
  hide,
});

const cristal: CristalApp = inject<CristalApp>("cristal")!;

const searchResults: Array<Attachment> = [
  {
    id: "image1",
    author: { name: "XWiki.Admin" },
    date: new Date(),
    href: "http://google.com",
    name: "My Image",
    mimetype: "img",
    size: 256,
  },
];

function search() {
  console.log("whoop search");
}
</script>

<template>
  <!-- TODO: add translations -->
  <x-dialog v-model="openedDialog" title="Insert image">
    <template #default>
      <x-tab-group>
        <template #tabs>
          <!-- TODO: work with a modular design -->
          <x-tab tab-id="search">Search</x-tab>
          <x-tab tab-id="upload">Upload</x-tab>
        </template>
        <template #panels>
          <x-tab-panel tab-id="search">
            <input type="text" placeholder="Image name" @change="search" />
            <div v-if="searchResults.length > 0">
              <div v-for="attachment in searchResults" :key="attachment.id">
                {{ attachment }}
              </div>
            </div>
            <div v-else>No results.</div>
          </x-tab-panel>
          <x-tab-panel tab-id="upload">Upload</x-tab-panel>
        </template>
      </x-tab-group>
    </template>
  </x-dialog>
</template>

<style scoped></style>
