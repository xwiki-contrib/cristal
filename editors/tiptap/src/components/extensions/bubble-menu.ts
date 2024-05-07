import { isMarkActive, isNodeActive } from "../../tiptap/helpers";
import { Editor } from "@tiptap/vue-3";
import { EditorState } from "@tiptap/pm/state";
import { Range } from "@tiptap/core";
import { Level } from "@tiptap/extension-heading";

// TODO: define icons, especially here where space is scarce and there is no
//  option to filter by text.
// TODO: also add condition, for instance some actions shouldn't be proposed on
// code.
export interface BubbleMenuAction {
  title: string;
  command: (params: { editor: Editor; range: Range }) => void;
  isActive: (state: EditorState) => boolean;
}

function getBoldAction(editor: Editor): BubbleMenuAction {
  return {
    title: "Bold",
    command({ editor }) {
      editor.commands.toggleBold();
    },
    isActive: isMarkActive(editor.schema.marks.strong),
  };
}

function getItalic(editor: Editor): BubbleMenuAction {
  return {
    title: "Italic",
    command({ editor }) {
      editor.commands.toggleItalic();
    },
    isActive: isMarkActive(editor.schema.marks.strong),
  };
}

function getHeadingAction(level: Level, editor: Editor): BubbleMenuAction {
  return {
    title: `H${level}`,
    command({ editor }) {
      editor.chain().toggleHeading({ level }).run();
    },
    isActive: isNodeActive(editor.schema.nodes.heading, { level: level }),
  };
}

export default function getMenuActions(editor: Editor): BubbleMenuAction[] {
  const numbers: Level[] = [1, 2, 3, 4, 5, 6];
  const headings: BubbleMenuAction[] = numbers.map((level) =>
    getHeadingAction(level, editor),
  );
  return [...headings, getBoldAction(editor), getItalic(editor)];
}
