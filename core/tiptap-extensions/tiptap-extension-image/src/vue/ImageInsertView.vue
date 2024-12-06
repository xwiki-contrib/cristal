<script setup lang="ts">
import { NodeViewWrapper } from "@tiptap/vue-3";
import { Tippy } from "vue-tippy";
import type { NodeViewProps } from "@tiptap/vue-3";
import "@tiptap/extension-image";

const { editor, getPos } = defineProps<NodeViewProps>();

function insert() {
  // Replace the current placeholder with the selected image
  editor
    .chain()
    .setNodeSelection(getPos())
    .command(({ commands }) => {
      commands.setImage({
        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzbpBTsq_MTGOmTMYjVl401IIQaq_fFGG5Gg&s",
      });
      return true;
    })
    .run();
}
</script>
<template>
  <node-view-wrapper>
    <x-btn @click="insert">Insert</x-btn>
    <tippy>
      <template #default>
        <div class="image-insert-view">Upload or select and attachment.</div>
      </template>
      <template #content> content </template>
    </tippy>
  </node-view-wrapper>
</template>

<style scoped>
.image-insert-view {
  background-color: var(--cr-color-neutral-100);
  border-radius: var(--cr-border-radius-large);
  border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  padding: var(--cr-spacing-x-small) var(--cr-spacing-x-small);
}
</style>
