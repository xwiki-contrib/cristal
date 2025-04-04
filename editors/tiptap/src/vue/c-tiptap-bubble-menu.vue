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
import CTiptapLinkEdit from "./c-tiptap-link-edit.vue";
import getMenuActions, {
  ElementType,
} from "../components/extensions/bubble-menu";
import { getLinkAction } from "../components/extensions/bubble-menu/text-actions";
import { isTextSelection } from "@tiptap/core";
import { ResolvedPos } from "@tiptap/pm/model";
import {
  EditorState,
  NodeSelection,
  Selection,
  SelectionRange,
} from "@tiptap/pm/state";
import { EditorView } from "@tiptap/pm/view";
import { BubbleMenu } from "@tiptap/vue-3";
import { CIcon, Size } from "@xwiki/cristal-icons";
import { ComputedRef, Ref, computed, ref, shallowRef } from "vue";
import type { BubbleMenuAction } from "../components/extensions/bubble-menu/BubbleMenuAction";
import type { Editor } from "@tiptap/core";
import type { Component } from "vue";

const props = defineProps<{
  editor: Editor;
}>();

const actions: ComputedRef<BubbleMenuAction[]> = computed(() => {
  const elementType = isImageFromSelection(props.editor.state.selection)
    ? ElementType.IMAGE
    : ElementType.TEXT;
  return getMenuActions(props.editor, elementType);
});

const additionalComponent: Ref<Component | undefined> = shallowRef();

const additionalComponentProps: Ref<
  | {
      action: BubbleMenuAction;
      editor: Editor;
      range: SelectionRange;
      url: string;
      isAmbiguous: boolean;
    }
  | undefined
> = ref();

/**
 * Compute if the current selection is inside a link.
 */
const simpleCursorInLink = computed(() => {
  return (
    props.editor.state.selection.empty &&
    findLinkCurrentSelection() != undefined
  );
});

/**
 * Find link at position, return the corresponding mark when found, undefined
 * otherwise.
 * @param pos - the provided position (e.g., the start of end of a selection)
 */
function findLinkPosition(pos: ResolvedPos) {
  return pos.marks().find((m) => m.type.name == "link");
}

/**
 * Return the mark of the link in the current selection.
 */
function findLinkCurrentSelection() {
  return findLinkPosition(props.editor.state.selection.$from);
}

/**
 * Set to true if the selection span over several links, or span over a link
 * and standard text.
 */
const isSelectionAmbiguous = computed(() => {
  const fromLinkMark = findLinkPosition(props.editor.state.selection.$from);
  const toLinkMark = findLinkPosition(props.editor.state.selection.$to);
  return fromLinkMark != toLinkMark;
});

/**
 * Return the href value of the currently selected link.
 */
const currentLinkUnderSelection = computed(() => {
  return findLinkCurrentSelection()?.attrs.href;
});

function apply(action: BubbleMenuAction) {
  if (action.additionalComponent) {
    additionalComponent.value = action.additionalComponent;
    additionalComponentProps.value = {
      action: action,
      editor: props.editor,
      range: props.editor.state.selection,
      url: currentLinkUnderSelection.value,
      isAmbiguous: isSelectionAmbiguous.value,
    };
  } else {
    action.command({
      editor: props.editor,
      range: props.editor.state.selection,
    });
  }
}

const hideOnEsc = {
  name: "hideOnEsc",
  defaultValue: true,
  fn({ hide }: { hide: () => void }) {
    function onKeyDown(event: KeyboardEvent) {
      if (event.keyCode === 27) {
        hide();
      }
    }

    return {
      onShow() {
        document.addEventListener("keydown", onKeyDown);
      },
      onHide() {
        document.removeEventListener("keydown", onKeyDown);
      },
    };
  },
};

function closeAdditionalComponent() {
  // RAZ the additional component when tippy is hidden,
  // otherwise we get stuck with the old component.
  additionalComponent.value = undefined;
  // The same thing goes for the additional component props.
  additionalComponentProps.value = undefined;
}

function isImageFromSelection(selection: Selection): boolean {
  return (
    selection instanceof NodeSelection && selection.node?.type.name == "image"
  );
}

/*
 * Compute whether the bubble menu must be shown, either because the selection
 * is empty and inside a link element, or because
 */
const shouldShow = ({
  editor,
  view,
  state,
  from,
  to,
}: {
  editor: Editor;
  view: EditorView;
  state: EditorState;
  from: number;
  to: number;
}) => {
  const { doc, selection } = state;
  const { empty: emptySelection } = selection;

  // Sometime check for `empty` is not enough.
  // Doubleclick an empty paragraph returns a node size of 2.
  // So we check also for an empty text size.
  const isEmptyTextBlock =
    doc.textBetween(from, to).length == 0 || !isTextSelection(selection);

  const hasEditorFocus = view.hasFocus();

  const isLink =
    selection.$head.marks().find((m) => m.type.name == "link") !== undefined;
  const isImage = isImageFromSelection(selection);

  // Don't show if the editor is not editable or don't have focus.
  if (!editor.isEditable || !hasEditorFocus) {
    return false;
  }

  // Show if the selection is not empty and the selection is not an empty text
  // block, or it the selection is empty but inside a link.
  return (
    (!emptySelection && !isEmptyTextBlock) ||
    isImage ||
    (emptySelection && isLink)
  );
};

const linkAction = getLinkAction(props.editor);
</script>

<template>
  <!-- @vue-ignore TODO the type of shouldShow needs to be refined-->
  <bubble-menu
    :editor="editor"
    :tippy-options="{
      plugins: [hideOnEsc],
      onHidden: closeAdditionalComponent,
      maxWidth: 'none',
    }"
    :should-show="shouldShow"
    class="items"
  >
    <div v-if="!simpleCursorInLink" v-show="!additionalComponent">
      <button
        v-for="action in actions"
        :key="action.title"
        class="item"
        :aria-label="action.title"
        :title="action.title"
        @click="apply(action)"
        @submit="apply(action)"
      >
        <c-icon :name="action.icon" :size="Size.Small"></c-icon>
      </button>
    </div>
    <CTiptapLinkEdit
      v-else
      :editor="editor"
      :action="linkAction"
      :range="editor.state.selection"
      :url="currentLinkUnderSelection"
      :has-wrapper="false"
    ></CTiptapLinkEdit>

    <!--
    It is possible for an action to provide an additional component. This is useful if the node or mark needs some
    additional actions (e.g., the link action requires a link value).
    -->
    <template
      v-if="
        additionalComponent && additionalComponentProps && !simpleCursorInLink
      "
    >
      <!-- If an additional component is provided by the sub-component,
      display it instead of the default content. -->
      <!-- Current the additional component does not have the choice of the
      close event.
      So the
      -->
      <component
        :is="additionalComponent"
        v-bind="additionalComponentProps"
        @close="closeAdditionalComponent"
      ></component>
    </template>
  </bubble-menu>
</template>

<style scoped>
.items {
  position: relative;
  display: flex;
  border-radius: var(--cr-tooltip-border-radius);
  border: 1px solid var(--cr-color-neutral-200);
  background: white; /* TODO: define a global variable for background color */
  box-shadow: var(--cr-shadow-medium);
}

.items > div {
  display: flex;
}

.item {
  background: transparent;
  border: none;
  padding: var(--cr-spacing-2x-small) var(--cr-spacing-x-small);
  border-radius: var(--cr-border-radius-medium);
}

.item:hover {
  background-color: var(--cr-color-neutral-200);
  cursor: pointer;
}
</style>
