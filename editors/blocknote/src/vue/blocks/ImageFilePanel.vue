<script setup lang="ts">
import ImageSuggestion from "./ImageSuggestion.vue";
import {
  EditorInlineContentSchema,
  EditorStyleSchema,
  EditorType,
} from "../../blocknote";
import { LinkEditionContext } from "../../components/linkEditionContext";
import { FilePanelProps } from "@blocknote/react";

const { editor, filePanelProps } = defineProps<{
  editor: EditorType;
  filePanelProps: FilePanelProps<EditorInlineContentSchema, EditorStyleSchema>;
  linkEditionCtx: LinkEditionContext;
}>();

const { block } = filePanelProps;

function update(url: string) {
  editor.updateBlock({ id: block.id }, { props: { url } });
}
</script>

<template>
  <div style="border: 1px solid black; padding: 5px; background-color: white">
    <!-- <ImageSuggestion :link-edition-ctx @selected="update" /> -->
    <ImageSuggestion @selected="({ url }) => update(url)" />
  </div>
</template>
