import {
  EditorInlineContentSchema,
  EditorSchema,
  EditorStyleSchema,
} from "../blocknote";
import { BlockNoteEditorOptions } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import React from "react";

type DefaultEditorOptionsType = BlockNoteEditorOptions<
  EditorSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
>;

/**
 * Properties for the {@link BlockNoteEditor} component
 */
type BlockNoteViewWrapperProps = {
  blockNoteOptions?: Partial<
    Omit<DefaultEditorOptionsType, "initialContent" | "schema">
  >;
};

type EditorInitialContent =
  | { syntax: "markdown"; source: string }
  | { syntax: "html"; source: string };

/**
 * BlockNote editor wrapper
 */
function BlockNoteViewWrapper({ blockNoteOptions }: BlockNoteViewWrapperProps) {
  // Creates a new editor instance.
  console.log({ blockNoteOptions });
  const editor = useCreateBlockNote(blockNoteOptions);

  // Renders the editor instance using a React component.
  return <BlockNoteView editor={editor} />;
}

export {
  BlockNoteViewWrapper,
  type BlockNoteViewWrapperProps,
  type EditorInitialContent,
  type EditorSchema,
};
