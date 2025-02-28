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
import { BlockNoteWrapper } from "../react/BlockNoteView";
import { NonSlotProps, reactComponentAdapter } from "../react-adapter";
import { CristalApp, PageData } from "@xwiki/cristal-api";
import {
  DocumentService,
  name as documentServiceName,
} from "@xwiki/cristal-document-api";
import { CArticle } from "@xwiki/cristal-skin";
import { createRoot } from "react-dom/client";
import { setVeauryOptions } from "veaury";
import { inject, ref, watch } from "vue";
import type { BlockNoteWrapperProps } from "../react/BlockNoteView";
import type { DocumentReference } from "@xwiki/cristal-model-api";
import type { Ref } from "vue";

setVeauryOptions({
  react: {
    createRoot,
  },
});

const cristal = inject<CristalApp>("cristal")!;
const container = cristal.getContainer();
const documentService = container.get<DocumentService>(documentServiceName);
const loading = documentService.isLoading();
const error = documentService.getError();
const currentPage = documentService.getCurrentDocument();
const currentPageReference: Ref<DocumentReference | undefined> =
  documentService.getCurrentDocumentReference();
const title = ref(""); // TODO
const titlePlaceholder = ref(""); // TODO

const BlockNoteViewAdapter = reactComponentAdapter(BlockNoteWrapper);

const editorProps = ref<NonSlotProps<BlockNoteWrapperProps> | null>(null);

function loadEditor(currentPage: PageData | undefined): void {
  if (!currentPage) {
    // TODO
    return;
  }

  if (currentPage.syntax !== "markdown/1.2") {
    // TODO
    throw new Error('TODO: only "markdown/1.2" syntax is supported here');
  }

  editorProps.value = {
    initialContent: {
      syntax: currentPage.syntax,
      source: currentPage.source,
    },
    theme: "light",
  };
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

function test() {
  alert("yoh");
}
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
      <h1 v-else>
        <BlockNoteViewAdapter v-bind="editorProps">
          <template #node:formattingToolbar>
            <button @click="test">hello world!</button>
          </template>
        </BlockNoteViewAdapter>
      </h1>
    </template>
  </c-article>
</template>
