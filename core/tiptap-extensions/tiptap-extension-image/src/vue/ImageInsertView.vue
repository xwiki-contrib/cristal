<script setup lang="ts">
import { NodeViewWrapper } from "@tiptap/vue-3";
import { CristalApp } from "@xwiki/cristal-api";
import { AttachmentsService } from "@xwiki/cristal-attachments-api";
import {
  Link,
  LinkSuggestServiceProvider,
  LinkType,
} from "@xwiki/cristal-link-suggest-api";
import {
  AttachmentReference,
  DocumentReference,
} from "@xwiki/cristal-model-api";
import { ModelReferenceParserProvider } from "@xwiki/cristal-model-reference-api";
import { RemoteURLSerializerProvider } from "@xwiki/cristal-model-remote-url-api";
import { LinkSuggestItem } from "@xwiki/cristal-tiptap-link-suggest-ui";
import { debounce } from "lodash";
import { Ref, inject, ref, useTemplateRef, watch } from "vue";
import { useRoute } from "vue-router";
import { useTippy } from "vue-tippy";
import type { NodeViewProps } from "@tiptap/vue-3";
import "@tiptap/extension-image";

const cristal = inject<CristalApp>("cristal")!;
const attachmentsService = cristal
  .getContainer()
  .get<AttachmentsService>("AttachmentsService");
const modelReferenceParser = cristal
  .getContainer()
  .get<ModelReferenceParserProvider>("ModelReferenceParserProvider")
  .get();
const remoteURLSerializer = cristal
  .getContainer()
  .get<RemoteURLSerializerProvider>("RemoteURLSerializerProvider")
  .get();

const route = useRoute();

const loading = attachmentsService.isLoading();

const imageNameQueryInput = useTemplateRef<HTMLInputElement>(
  "imageNameQueryInput",
);

const fileUpload = useTemplateRef<HTMLInputElement>("fileUpload");
const contentRef = useTemplateRef<HTMLDivElement>("content");

const { editor, getPos } = defineProps<NodeViewProps>();

useTippy(contentRef.value!, {
  showOnCreate: true,
  // hideOnClick: true,
  // interactive: true,
  onClickOutside() {
    console.log("CLICK OUTSIDE");
  },
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

const links: Ref<Link[]> = ref([]);
const linksSearchError: Ref<string | undefined> = ref(undefined);
const linksSearchLoading: Ref<boolean> = ref(false);

const linkSuggestServiceProvider = cristal
  .getContainer()
  .get<LinkSuggestServiceProvider>("LinkSuggestServiceProvider");
const linkSuggestService = linkSuggestServiceProvider.get()!;

async function searchAttachments<T>(query: string) {
  links.value = await linkSuggestService.getLinks(query, LinkType.ATTACHMENT);
}

watch(
  imageNameQuery,
  debounce(async () => {
    if (imageNameQuery.value && imageNameQuery.value.length > 2) {
      const query = imageNameQuery.value;
      await searchAttachments(query);
    }
  }, 500),
);
// Start a first empty search on the first load, to not let the content empty.
searchAttachments("");

function insertTextAsLink() {
  if (imageNameQuery.value) {
    insertImage(imageNameQuery.value);
  }
}

function convertLink(link: Link) {
  return { type: link.type, title: link.label, segments: [] };
}

function triggerUpload() {
  fileUpload.value?.click();
}

async function fileSelected() {
  const files = fileUpload.value?.files;
  if (files && files.length > 0) {
    const fileItem = files.item(0)!;
    const currentPageName =
      (route.params.page as string) ||
      cristal.getCurrentPage() ||
      "Main.WebHome";
    await attachmentsService.upload(currentPageName, [fileItem]);

    const parser = modelReferenceParser?.parser(currentPageName);

    const src = remoteURLSerializer?.serialize(
      new AttachmentReference(fileItem.name, parser as DocumentReference),
    );
    if (src) insertImage(src);
  }
}
</script>

<template>
  <node-view-wrapper>
    <div class="image-insert-view">Upload or select and attachment.</div>

    <div ref="content" class="image-insert-view-content">
      <div v-if="loading">Loading...</div>
      <ul v-else>
        <li class="item">
          <x-btn @click="triggerUpload">Upload</x-btn>
          <input
            v-show="false"
            ref="fileUpload"
            type="file"
            accept="image/*"
            @change="fileSelected"
          />
        </li>
        <li class="item">
          <input
            ref="imageNameQueryInput"
            v-model="imageNameQuery"
            type="text"
            placeholder="Image name or image URL"
            @keydown.enter="insertTextAsLink"
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
            v-for="link in links"
            :key="link.id"
            :class="['item', 'selectable-item', selected ? 'is-selected' : '']"
            @keydown.enter="insertImage(link.url)"
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
