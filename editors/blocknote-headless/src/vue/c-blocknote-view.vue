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
import { AutoSaver } from "../components/autoSaver";
import { computeCurrentUser } from "../components/currentUser";
import { createLinkEditionContext } from "../components/linkEditionContext";
import { providerRef } from "../components/realtimeState";
import {
  BlockNoteViewWrapper,
  BlockNoteViewWrapperProps,
} from "../react/BlockNoteView";
import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  DocumentService,
  name as documentServiceName,
} from "@xwiki/cristal-document-api";
import {
  ReactNonSlotProps,
  reactComponentAdapter,
} from "@xwiki/cristal-reactivue";
import { Container } from "inversify";

import { createI18n } from "vue-i18n";
import type { SkinManager } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api/dist";

const { editorProps, container, skinManager } = defineProps<{
  editorProps: ReactNonSlotProps<BlockNoteViewWrapperProps>;
  container: Container;
  skinManager: SkinManager;
}>();

const emit = defineEmits<
  // TODO: the type of the content might change!
  (e: "blocknote-save", content: string) => void
>();

defineExpose({
  async getContent() {
    return extractEditorContent();
  },
});

async function extractEditorContent() {
  const editor = editorProps.editorRef?.value;
  return editor?.blocksToMarkdownLossy(editor?.document);
}

// eslint-disable-next-line max-statements
async function getRealtimeProvider(): Promise<
  NonNullable<BlockNoteViewWrapperProps["blockNoteOptions"]>["collaboration"]
> {
  const documentService = container.get<DocumentService>(documentServiceName);
  const authenticationManager = container
    .get<AuthenticationManagerProvider>("AuthenticationManagerProvider")
    .get()!;

  if (!editorProps.realtimeServerURL) {
    return undefined;
  }

  const documentReference =
    documentService.getCurrentDocumentReferenceString().value;

  if (!documentReference) {
    throw new Error("Got no document reference!");
  }

  const provider = new HocuspocusProvider({
    url: editorProps.realtimeServerURL,
    // we distinguish from sessions from other editors with a ':blocknote' suffix.
    name: `${documentReference}:blocknote`,
  });

  new AutoSaver(provider, async () => {
    const content = await extractEditorContent();
    if (content) {
      emit("blocknote-save", content);
    }
  });

  // TODO: add listen when no realtime

  const user = await computeCurrentUser(authenticationManager);

  providerRef.value = provider;

  return {
    provider,
    fragment: provider.document.getXmlFragment("document-store"),
    user,
  };
}

const collaboration = await getRealtimeProvider();

const editorPropsInitialized = {
  ...editorProps,
  blockNoteOptions: {
    ...editorProps.blockNoteOptions,
    collaboration,
  },
};

const BlockNoteViewAdapter = reactComponentAdapter(BlockNoteViewWrapper, {
  modifyVueApp: (app) => {
    skinManager.loadDesignSystem(app, container);

    app.use(createI18n({ legacy: false, fallbackLocale: "en" }));

    app.provide("container", container);
  },
});

const linkEditionCtx = createLinkEditionContext(container);
</script>

<template>
  <BlockNoteViewAdapter v-bind="editorPropsInitialized">
    <!-- Custom (popover) formatting toolbar -->
    <template #formattingToolbar="{ editor, currentBlock }">
      <ImageToolbar
        v-if="currentBlock.type === 'image'"
        :editor
        :current-block
      />

      <strong v-else>Unknown block type: {{ currentBlock.type }}</strong>
    </template>

    <!-- Custom (popover) toolbar for link edition -->
    <template #linkToolbar="{ editor, linkToolbarProps }">
      <LinkToolbar :editor :link-toolbar-props :link-edition-ctx />
    </template>

    <!-- Custom (popover) file panel for editing file-like blocks -->
    <template #filePanel="{ editor, filePanelProps }">
      <ImageFilePanel
        v-if="filePanelProps.block.type === 'image'"
        :editor
        :file-panel-props
        :link-edition-ctx
      />

      <strong v-else>
        Unexpected file type block: {{ filePanelProps.block.type }}
      </strong>
    </template>
  </BlockNoteViewAdapter>
</template>
