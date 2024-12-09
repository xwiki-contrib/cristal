<script setup lang="ts">
import type { NodeViewProps } from "@tiptap/vue-3";
import { NodeViewWrapper } from "@tiptap/vue-3";
import { CristalApp } from "@xwiki/cristal-api";
import {
  Link,
  LinkSuggestServiceProvider,
  LinkType,
} from "@xwiki/cristal-link-suggest-api";
import { debounce } from "lodash";
import { inject, Ref, ref, useTemplateRef, watch } from "vue";
import "@tiptap/extension-image";
import { useTippy } from "vue-tippy";
import { LinkSuggestItem } from "@xwiki/cristal-tiptap-link-suggest-ui";

const imageNameQueryInput = useTemplateRef<HTMLInputElement>(
  "imageNameQueryInput",
);

const contentRef = useTemplateRef<HTMLDivElement>("content");
const { editor, getPos } = defineProps<NodeViewProps>();

useTippy(contentRef.value!, {
  showOnCreate: true,
});

function insertImage(src: string) {
  // Replace the current placeholder with the selected image
  editor
    .chain()
    .setNodeSelection(getPos())
    .command(({ commands }) => {
      commands.setImage({
        src,
      });
      return true;
    })
    .run();
}

const imageNameQuery = defineModel<string>("imageNameQuery");
const cristal = inject<CristalApp>("cristal")!;

const links: Ref<Link[]> = ref([]);
const linksSearchError: Ref<string | undefined> = ref(undefined);
const linksSearchLoading: Ref<boolean> = ref(false);

const linkSuggestServiceProvider = cristal
  .getContainer()
  .get<LinkSuggestServiceProvider>("LinkSuggestServiceProvider");
const linkSuggestService = linkSuggestServiceProvider.get()!;
watch(
  imageNameQuery,
  debounce(async () => {
    if (imageNameQuery.value && imageNameQuery.value.length > 2) {
      links.value = await linkSuggestService.getLinks(
        imageNameQuery.value,
        LinkType.ATTACHMENT,
      );
    }
  }, 500),
);

function insertTextAsLink() {
  if (imageNameQuery.value) {
    insertImage(imageNameQuery.value);
  }
}

function convertLink(link: Link) {
  return { type: link.type, title: link.label, segments: [] };
}
</script>

<template>
  <node-view-wrapper>
    <div class="image-insert-view">Upload or select and attachment.</div>

    <div ref="content" class="image-insert-view-content">
      <ul>
        <li class="item">
          <x-btn>Upload</x-btn>
        </li>
        <li class="item">
          <input
            ref="imageNameQueryInput"
            v-model="imageNameQuery"
            type="text"
            placeholder="Image name or image URL"
            @enter="insertTextAsLink"
          />
        </li>
        <li v-if="linksSearchLoading" class="item">Loading...</li>
        <li v-else-if="linksSearchError" class="item">
          {{ linksSearchError }}
        </li>
        <li
          v-else-if="
            links.length == 0 && imageNameQuery && imageNameQuery.length > 2
          "
          class="item"
        >
          No results
        </li>
        <template v-else>
          <!-- factorize with c-tiptap-link-suggest -->
          <li
            :class="['item', 'selectable-item', selected ? 'is-selected' : '']"
            @keydown.enter="insertImage(link.url)"
            v-for="link in links"
            :key="link.id"
            @click="insertImage(link.url)"
          >
            <link-suggest-item :link="convertLink(link)"></link-suggest-item>
          </li>
        </template>
      </ul>
    </div>
  </node-view-wrapper>
</template>

<style scoped>
.image-insert-view {
  background-color: var(--cr-color-neutral-100);
  border-radius: var(--cr-border-radius-large);
  border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  padding: var(--cr-spacing-x-small) var(--cr-spacing-x-small);
}

.image-insert-view-content {
  padding: 0;
  position: relative;
  border-radius: var(--cr-tooltip-border-radius);
  background: white;
  overflow: hidden auto;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  width: 300px;
}

.image-insert-view-content input {
  width: 100%;
}

.image-insert-view-content ul {
  list-style: none;
}

.image-insert-view-content .item {
  display: block;
  background: transparent;
  border: none;
  padding: var(--cr-spacing-x-small);
  width: 100%;
  text-align: start;
}

.image-insert-view-content .selectable-item.is-selected,
.image-insert-view-content .selectable-item:hover {
  background-color: var(--cr-color-neutral-200);
  cursor: pointer;
}
</style>
