<script setup lang="ts">
import { computed, type ComputedRef, inject, type Ref, ref, watch } from "vue";
import { CristalApp, PageData } from "@cristal/api";
import { useRoute } from "vue-router";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import Document from "@tiptap/extension-document";
import {
  Slash,
  getSuggestionItems,
  renderItems,
} from "../components/extensions/slash";

const route = useRoute();
const cristal: CristalApp = inject<CristalApp>("cristal")!;
const loading = ref(false);
const currentPage: Ref<PageData | undefined> = ref(undefined);
const error: Ref<Error | undefined> = ref(undefined);

// TODO: load this content first, then initialize the editor.
// Make the loading status first.
const content = ref("abcd");

// const suggestion = Suggestion({
//   char: "/",
// });
const editor = new Editor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: "////// ahahha",
    }),
    Text,
    Document,
    Slash.configure({
      suggestion: {
        items: getSuggestionItems,
        render: renderItems,
      },
    }),
  ],
  onUpdate: () => {
    content.value = editor.getHTML();
  },
});

const currentPageName: ComputedRef<string> = computed(() => {
  // TODO: define a proper abstraction.
  return (
    (route.params.page as string) || cristal.getCurrentPage() || "Main.WebHome"
  );
});

async function fetchPage() {
  loading.value = true;
  try {
    currentPage.value = await cristal.getPage(currentPageName.value);
  } catch (e) {
    console.error(e);
    error.value = e;
  } finally {
    loading.value = false;
  }
}

watch(() => route.params.page, fetchPage, { immediate: true });

// /**
//  * Make sure to destroy the editor before creating a new one,
//  * or when this component is unmounted.
//  */
// function destroyEditor() {
//   // if (view) {
//   //   // view.destroy();
//   //   // TODO
//   // }
//   editor?.destroy();
// }

// onBeforeUpdate(destroyEditor);
// onBeforeUnmount(destroyEditor);
// onMounted(() => {
//   editor = new Editor({
//     content: "<p>I’m running Tiptap with Vue.js. 🎉</p>",
//     extensions: [StarterKit],
//   });
// });

const viewRouterParams = {
  name: "view",
  params: { page: currentPageName.value },
};
const submit = async () => {
  // const markdown = defaultMarkdownSerializer.serialize(view.state.doc);
  // TODO: html does not make any sense here.
  await cristal
    ?.getWikiConfig()
    .storage.save(currentPageName.value, "TODO", "html");
  cristal?.getRouter().push(viewRouterParams);
};
</script>

<template>
  <div v-if="loading" class="content-loading">
    <!-- TODO: provide a proposer loading UI. -->
    <span class="load-spinner"></span>
    <h3>Loading</h3>
  </div>
  <div v-else-if="error" class="editor-error">
    <!-- TODO: provide a better error reporting. -->
    {{ error }}
  </div>
  <div class="inner-content">
    <div v-show="!loading && !error" class="content">
      <div class="content-scroll">
        <div class="whole-content">
          <editor-content
            :editor="editor"
            class="document-content editor"
            v-model="content"
          />
          {{ content }}
        </div>
      </div>
      <form class="pagemenu" @submit="submit">
        <x-btn size="small" variant="primary" @click="submit">Save</x-btn>
        <router-link :to="viewRouterParams">
          <x-btn size="small">Cancel</x-btn>
        </router-link>
      </form>
    </div>
  </div>
</template>

<style scoped>
.content-loading {
  display: flex;
  flex-flow: column;
  height: 100vh;
  align-items: center;
  justify-content: center;
}

.content-loading svg {
  width: 64px;
  height: 64px;
}

.content-loading h3 {
  padding: 0;
  margin: 0;
  color: var(--cr-color-neutral-500);
}

.pagemenu {
  display: flex;
  flex-flow: row;
  gap: var(--cr-spacing-x-small);
  padding: var(--cr-spacing-x-small) var(--cr-spacing-x-small);
  background: var(--cr-color-neutral-100);
  width: var(--cr-spacing-max-page);
  margin: var(--cr-spacing-x-small) auto;
  border-radius: var(--cr-input-border-radius-medium);
  max-width: var(--cr-sizes-max-page-width);
  width: 100%;
}

:deep(.ProseMirror-menubar) {
  border-radius: var(--cr-input-border-radius-medium);
  border-bottom: none;
  padding: var(--cr-spacing-x-small) var(--cr-spacing-x-small);
  background: var(--cr-color-neutral-100);
}

/*
TODO: should be moved to a css specific to the empty line placeholder plugin.
 */
.editor :deep(.placeholder):before {
  display: block;
  pointer-events: none;
  height: 0;
  content: attr(data-empty-text);
}
</style>
