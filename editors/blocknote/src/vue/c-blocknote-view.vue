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
import {
  BlockNoteViewWrapper,
  BlockNoteViewWrapperProps,
} from "../react/BlockNoteView";
import { CristalApp } from "@xwiki/cristal-api";
import {
  ReactNonSlotProps,
  reactComponentAdapter,
} from "@xwiki/cristal-reactivue";
import { createI18n } from "vue-i18n";

const props = defineProps<{
  editorProps: ReactNonSlotProps<BlockNoteViewWrapperProps>;
  cristal: CristalApp;
}>();

const container = props.cristal.getContainer();

const BlockNoteViewAdapter = reactComponentAdapter(BlockNoteViewWrapper, {
  modifyVueApp: (app) => {
    props.cristal.getSkinManager().loadDesignSystem(app, container);

    // TODO: import from global
    // TODO: language
    app.use(createI18n({ legacy: false, fallbackLocale: "en" }));

    app.provide("cristal", props.cristal);
  },
});

const linkEditionCtx = createLinkEditionContext(container);
</script>

<template>
  <BlockNoteViewAdapter v-bind="editorProps">
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
