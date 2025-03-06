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
import ImageFilePanel from "./blocks/ImageFilePanel.vue";
import ImageToolbar from "./blocks/ImageToolbar.vue";
import LinkToolbar from "./blocks/LinkToolbar.vue";
import { createLinkEditionContext } from "../components/linkEditionContext";
import { BlockNoteViewWrapper } from "../react/BlockNoteView";
import { CristalApp, PageData } from "@xwiki/cristal-api";
import { AttachmentsService } from "@xwiki/cristal-attachments-api";
import {
  DocumentService,
  name as documentServiceName,
} from "@xwiki/cristal-document-api";
import { MarkdownRenderer } from "@xwiki/cristal-markdown-api";
import { reactComponentAdapter } from "@xwiki/cristal-reactivue";
import { CArticle } from "@xwiki/cristal-skin";
import { inject, ref, watch } from "vue";
import { createI18n } from "vue-i18n";
import type { BlockNoteViewWrapperProps } from "../react/BlockNoteView";
import type { DocumentReference } from "@xwiki/cristal-model-api";
import type { ReactNonSlotProps } from "@xwiki/cristal-reactivue";
import type { Ref } from "vue";

const cristal = inject<CristalApp>("cristal")!;
const container = cristal.getContainer();
const attachmentsService =
  container.get<AttachmentsService>("AttachmentsService");
const documentService = container.get<DocumentService>(documentServiceName);
const loading = documentService.isLoading();
const error = documentService.getError();
const currentPage = documentService.getCurrentDocument();
const currentPageReference: Ref<DocumentReference | undefined> =
  documentService.getCurrentDocumentReference();
const markdownRenderer = container.get<MarkdownRenderer>("MarkdownRenderer");

const title = ref(""); // TODO
const titlePlaceholder = ref(""); // TODO

const linkEditionCtx = createLinkEditionContext(container);

const BlockNoteViewAdapter = reactComponentAdapter(BlockNoteViewWrapper, {
  modifyVueApp: (app) => {
    cristal.getSkinManager().loadDesignSystem(app, container);

    // TODO: import from global
    // TODO: language
    app.use(createI18n({ legacy: false, fallbackLocale: "en" }));

    app.provide("cristal", cristal);
  },
});

const editorProps = ref<ReactNonSlotProps<BlockNoteViewWrapperProps> | null>(
  null,
);

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
      syntax: "html",
      source: markdownRenderer.render(currentPage.source),
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
          <template #formattingToolbar="{ editor, currentBlock }">
            <ImageToolbar
              v-if="currentBlock.type === 'image'"
              :editor
              :current-block
            />
            <div v-else>
              <strong>Unknown block type: {{ currentBlock.type }}</strong>
            </div>
          </template>

          <template #linkToolbar="{ editor, linkToolbarProps }">
            <LinkToolbar :editor :link-toolbar-props :link-edition-ctx />
          </template>

          <template #filePanel="{ editor, filePanelProps }">
            <ImageFilePanel :editor :file-panel-props :link-edition-ctx />
          </template>
        </BlockNoteViewAdapter>
      </h1>
    </template>
  </c-article>
</template>
