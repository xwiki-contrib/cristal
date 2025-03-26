<!--
See the LICENSE file distributed with this work for additional
information regarding copyright ownership.

This is free software; you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License as
published by the Free Software Foundation; either version 2.1 of
the License, or (at your option) any later version.

This software is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public
License along with this software; if not, write to the Free
Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
02110-1301 USA, or see the FSF site: http://www.fsf.org.
-->
<script setup lang="ts">
import CBlockNoteView from "./c-blocknote-view.vue";
import CRealtimeUsers from "./c-realtime-users.vue";
import { computeCurrentUser } from "../components/currentUser";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { CristalApp, PageData } from "@xwiki/cristal-api";
import { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";
import {
  DocumentService,
  name as documentServiceName,
} from "@xwiki/cristal-document-api";
// import { MarkdownRenderer } from "@xwiki/cristal-markdown-api";
import { CArticle } from "@xwiki/cristal-skin";
import { inject, ref, shallowRef, watch } from "vue";
import type { BlockNoteViewWrapperProps } from "../react/BlockNoteView";
import type { DocumentReference } from "@xwiki/cristal-model-api";
import type { ReactNonSlotProps } from "@xwiki/cristal-reactivue";
import type { Ref } from "vue";

const cristal = inject<CristalApp>("cristal")!;
const container = cristal.getContainer();
const documentService = container.get<DocumentService>(documentServiceName);
const loading = documentService.isLoading();
const error = documentService.getError();
const currentPage = documentService.getCurrentDocument();
const currentPageReference: Ref<DocumentReference | undefined> =
  documentService.getCurrentDocumentReference();
// const markdownRenderer = container.get<MarkdownRenderer>("MarkdownRenderer");
const authenticationManager = container
  .get<AuthenticationManagerProvider>("AuthenticationManagerProvider")
  .get();

const { realtimeURL } = cristal.getWikiConfig();

const title = ref(""); // TODO
const titlePlaceholder = ref("");

const editorProps =
  shallowRef<ReactNonSlotProps<BlockNoteViewWrapperProps> | null>(null);

const realtimeProvider = shallowRef<HocuspocusProvider | null>(null);

async function getRealtimeProvider(): Promise<
  NonNullable<BlockNoteViewWrapperProps["blockNoteOptions"]>["collaboration"]
> {
  if (!realtimeURL) {
    return undefined;
  }

  const documentReference =
    documentService.getCurrentDocumentReferenceString().value;

  if (!documentReference) {
    throw new Error("Got no document reference!");
  }

  const provider = new HocuspocusProvider({
    url: realtimeURL,
    name: documentReference,
    // token?
  });

  const user = await computeCurrentUser(authenticationManager);

  return {
    provider,
    fragment: provider.document.getXmlFragment("document-store"),
    user,
  };
}

// eslint-disable-next-line max-statements
async function loadEditor(currentPage: PageData | undefined): Promise<void> {
  if (!currentPage) {
    // TODO
    return;
  }

  if (currentPage.syntax !== "markdown/1.2") {
    // TODO
    throw new Error('TODO: only "markdown/1.2" syntax is supported here');
  }

  const collaboration = await getRealtimeProvider();

  if (collaboration) {
    console.info(`Setting up realtime collaboration with URL: ${realtimeURL}`);
    realtimeProvider.value = collaboration.provider;
  }

  editorProps.value = {
    theme: "light",
    // TODO: improve to also support html, or discard editing for unsupported syntaxes?
    content: currentPage.source,
    blockNoteOptions: {
      collaboration,
    },
    formattingToolbarOnlyFor: [],
  };

  title.value = documentService.getTitle().value ?? "";
  titlePlaceholder.value = documentService.getTitle().value ?? "";
}

function submit() {
  alert("TODO: save");
}

watch(
  loading,
  (newLoading) => {
    if (!newLoading) {
      loadEditor(currentPage.value);
    }
  },
  { immediate: true },
);
</script>

<template>
  <c-article
    :loading
    :error
    :current-page
    :current-page-reference
    page-exist
    before-u-i-x-p-id="edit.before"
    after-u-i-x-p-id="edit.after"
  >
    <template #title>
      <input
        v-model="title"
        type="text"
        :placeholder="titlePlaceholder"
        class="doc-title"
      />
    </template>
    <template #default>
      <h1 v-if="!editorProps">Loading...</h1>
      <template v-else>
        <div class="editor-centerer">
          <div class="editor">
            <CBlockNoteView :editor-props :cristal />
          </div>
        </div>

        <form class="pagemenu" @submit="submit">
          <div class="pagemenu-status">
            <c-realtime-users
              v-if="realtimeProvider"
              :provider="realtimeProvider"
            />

            <!-- <c-save-status
              v-if="editor && hasRealtime"
              :auto-saver="editor.storage.cristalCollaborationKit.autoSaver"
            /> -->
          </div>

          <div class="pagemenu-actions">
            <x-btn size="small" variant="primary" @click="submit">Close</x-btn>
          </div>
        </form>
      </template>
    </template>
  </c-article>
</template>

<style scoped>
.pagemenu {
  position: sticky;
  bottom: 0;
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

.pagemenu-status {
  /* The content of this section may be a mix of inline and block level elements. */
  display: flex;
  /* Push the actions to the right end of the menu. */
  flex-grow: 1;
}

.pagemenu-status > * {
  /* Match the action button padding, which seems to be hard-coded.  */
  padding: 0 12px;
}

.editor-centerer {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.editor {
  outline: none;
  max-width: var(--cr-sizes-max-page-width);
  width: 100%;
}
</style>
