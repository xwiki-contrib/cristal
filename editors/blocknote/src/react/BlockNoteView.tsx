import {
  Block,
  BlockNoteEditor,
  BlockNoteEditorOptions,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  FormattingToolbar,
  FormattingToolbarController,
  useCreateBlockNote,
} from "@blocknote/react";
import React, { ReactElement, useEffect, useState } from "react";

type DefaultEditorOptionsType = BlockNoteEditorOptions<
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema
>;

/**
 * Properties for the {@link BlockNoteEditor} component
 */
type BlockNoteViewWrapperProps = {
  initialContent: EditorInitialContent;
  blockNoteOptions?: Partial<
    Omit<DefaultEditorOptionsType, "initialContent" | "schema">
  >;
  theme?: "light" | "dark";
  readonly?: boolean;
  formattingToolbar: ReactElement;
};

type EditorInitialContent = { syntax: "markdown/1.2"; source: string };

/**
 * BlockNote editor wrapper
 */
function BlockNoteViewWrapper({
  initialContent,
  blockNoteOptions,
  theme,
  readonly,
  formattingToolbar,
}: BlockNoteViewWrapperProps) {
  // Creates a new editor instance.
  const editor = useCreateBlockNote(blockNoteOptions);

  // Is initial content being converted?
  const [convertingInitialContent, setConvertingInitialContent] =
    useState(true);

  // Convert the initial content to blocks
  useEffect(() => {
    contentToBlock(editor, initialContent).then((blocks) => {
      editor.replaceBlocks(editor.document, blocks);
      setConvertingInitialContent(false);
    });
  }, [setConvertingInitialContent]);

  // Renders the editor instance using a React component.
  return (
    <BlockNoteView
      editor={editor}
      editable={!convertingInitialContent && readonly !== true}
      theme={theme}
      formattingToolbar={false}
    >
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>Toolbar: {formattingToolbar}</FormattingToolbar>
        )}
      />
    </BlockNoteView>
  );
}

function contentToBlock(
  editor: BlockNoteEditor,
  content: EditorInitialContent,
): Promise<Block[]> {
  switch (content.syntax) {
    case "markdown/1.2":
      return editor.tryParseMarkdownToBlocks(content.source);
  }
}

export {
  BlockNoteViewWrapper,
  type BlockNoteViewWrapperProps,
  type EditorInitialContent,
};
