import {
  BlockType,
  EditorInlineContentSchema,
  EditorSchema,
  EditorStyleSchema,
  EditorType,
} from "../blocknote";
import {
  Block,
  BlockNoteEditor,
  BlockNoteEditorOptions,
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import {
  FilePanelController,
  FilePanelProps,
  FormattingToolbar,
  FormattingToolbarController,
  LinkToolbarController,
  LinkToolbarProps,
  useCreateBlockNote,
} from "@blocknote/react";
import { ReactivueChild } from "@xwiki/cristal-reactivue";
import React, { useEffect, useState } from "react";

type DefaultEditorOptionsType = BlockNoteEditorOptions<
  EditorSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
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

  formattingToolbar: ReactivueChild<{
    editor: EditorType;
    currentBlock: BlockType;
  }>;

  linkToolbar: ReactivueChild<{
    editor: EditorType;
    linkToolbarProps: LinkToolbarProps;
  }>;

  filePanel: ReactivueChild<{
    editor: EditorType;
    filePanelProps: FilePanelProps<
      EditorInlineContentSchema,
      EditorStyleSchema
    >;
  }>;
};

type EditorInitialContent =
  | { syntax: "markdown"; source: string }
  | { syntax: "html"; source: string };

/**
 * BlockNote editor wrapper
 */
function BlockNoteViewWrapper({
  initialContent,
  blockNoteOptions,
  theme,
  readonly,
  formattingToolbar: CustomFormattingToolbar,
  linkToolbar: CustomLinkToolbar,
  filePanel: CustomFilePanel,
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
      // Override some builtin components
      formattingToolbar={false}
      linkToolbar={false}
      filePanel={false}
    >
      <FormattingToolbarController
        formattingToolbar={() => (
          <FormattingToolbar>
            <CustomFormattingToolbar
              editor={editor}
              currentBlock={editor.getTextCursorPosition().block}
            />
          </FormattingToolbar>
        )}
      />

      <LinkToolbarController
        linkToolbar={(props) => (
          <CustomLinkToolbar editor={editor} linkToolbarProps={props} />
        )}
      />

      <FilePanelController
        filePanel={(props) => (
          <CustomFilePanel editor={editor} filePanelProps={props} />
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
    case "markdown":
      return editor.tryParseMarkdownToBlocks(content.source);

    case "html":
      return editor.tryParseHTMLToBlocks(content.source);
  }
}

export {
  BlockNoteViewWrapper,
  type BlockNoteViewWrapperProps,
  type EditorInitialContent,
  type EditorSchema,
};
