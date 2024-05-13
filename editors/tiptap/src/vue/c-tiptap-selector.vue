<script setup lang="ts">
import {
  computed,
  ComputedRef,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";

import tippy, { GetReferenceClientRect, Instance, Props } from "tippy.js";
import { SuggestionProps } from "@tiptap/suggestion";
import { ActionDescriptor } from "../components/extensions/slash";

const container = ref();

const props = defineProps<{
  props: SuggestionProps<unknown>;
}>();

const items: ComputedRef<{ title: string }[]> = computed(
  () => props.props.items as ActionDescriptor[],
);

let popup: Instance<Props>[];

onMounted(() => {
  popup = tippy("body", {
    getReferenceClientRect: props.props.clientRect as GetReferenceClientRect,
    appendTo: () => document.body,
    content: container.value,
    showOnCreate: true,
    interactive: true,
    trigger: "manual",
    placement: "bottom-start",
  });
});

onUnmounted(() => {
  popup[0].destroy();
});

const index = ref(0);

function down() {
  index.value = (index.value + 1) % props.props.items.length;
}

function up() {
  index.value =
    (index.value + props.props.items.length - 1) % props.props.items.length;
}

function enter() {
  // TODO: loop based on the items provided by renderItems and getSuggestionItems
  // on enter, get the command corresponding to the currently selected item and execute it
  apply(index.value);
}

function apply(index: number) {
  // TODO: get by index and apply action
  const item = props.props.items[index];
  if (item) {
    props.props.command(item);
  }
}

// Make sure the newly selected item is visible on element focus change.
watch(index, async () => {
  // Wait for the container to be re-pained to run the selector on the newly
  // selected element.
  await nextTick();
  container.value.querySelector(".is-selected").scrollIntoView();
});
</script>

<template>
  <div
    ref="container"
    class="items"
    @keydown.down="down"
    @keydown.up="up"
    @keydown.enter="enter"
  >
    <button
      v-for="(item, itemIndex) in items"
      :key="item.title"
      :class="['item', index == itemIndex ? 'is-selected' : '']"
      @click="apply(itemIndex)"
    >
      {{ item.title }}
    </button>
  </div>
</template>

<style scoped>
.items {
  position: relative;
  border-radius: 0.25rem;
  background: white;
  color: rgba(0, 0, 0, 0.8);
  overflow: hidden auto;
  font-size: 0.9rem;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.1);
  max-height: 300px;
}

.item {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 0.2rem 0.5rem;
}

.item.is-selected,
.item:hover {
  color: #a975ff;
  background: rgba(169, 117, 255, 0.1);
}
</style>
