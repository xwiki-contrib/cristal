<script setup lang="ts">
import { Editor, BubbleMenu } from "@tiptap/vue-3";
import getMenuActions, {
  BubbleMenuAction,
} from "../components/extensions/bubble-menu";
import { computed, ComputedRef } from "vue";

const props = defineProps<{
  editor: Editor;
}>();

const actions: ComputedRef<BubbleMenuAction[]> = computed(() =>
  getMenuActions(props.editor),
);

function apply(action: BubbleMenuAction) {
  action.command({
    editor: props.editor,
    range: props.editor.state.selection,
  });
}
</script>

<template>
  <bubble-menu
    :editor="editor"
    :tippy-options="{ duration: 100 }"
    class="items"
  >
    <button
      v-for="action in actions"
      :key="action.title"
      class="item"
      @click="apply(action)"
    >
      {{ action.title }}
    </button>
  </bubble-menu>
</template>

<style scoped>
.items {
  position: relative;
  border-radius: 0.25rem;
  background: white;
  color: rgba(0, 0, 0, 0.8);
  overflow: hidden;
  font-size: 0.9rem;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.1);
}

.item {
  text-align: left;
  background: transparent;
  border: none;
  padding: 0.5rem 0.2rem;
}
</style>
