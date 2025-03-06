<script setup lang="ts">
import LinkSuggestion from "./LinkSuggestion.vue";
import { EditorType } from "../../blocknote";
import { LinkEditionContext } from "../../components/linkEditionContext";
import { LinkToolbarProps } from "@blocknote/react";

defineProps<{
  editor: EditorType;
  linkToolbarProps: LinkToolbarProps;
  linkEditionCtx: LinkEditionContext;
}>();
</script>

<template>
  <div style="border: 1px solid black; padding: 5px; background-color: white">
    <LinkSuggestion
      :link-edition-ctx
      @selected="({ url, title }) => linkToolbarProps.editLink(url, title)"
    />
  </div>
</template>
