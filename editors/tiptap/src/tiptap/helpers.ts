import { NodeType } from "@tiptap/pm/model";
import { EditorState } from "@tiptap/pm/state";
import { findParentNode } from "@tiptap/vue-3";

export function isNodeActive(type: NodeType, attrs?: Record<string, any>) {
  return (state: EditorState) => {
    let isActive = false;
    if (type) {
      const nodeAfter = state.selection.$from.nodeAfter;
      let node = nodeAfter?.type == type ? nodeAfter : undefined;
      if (!node) {
        const parent = findParentNode((node) => node.type === type)(
          state.selection,
        );
        node = parent?.node;
      }

      if (node) {
        isActive = node?.hasMarkup(type, { ...node.attrs, ...attrs });
      }
    }
    return isActive;
  };
}
