import {
  BlockType,
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorSchema,
  EditorStyleSchema,
  EditorType,
  createBlockNoteSchema,
  createDictionary,
  querySuggestionsMenuItems,
} from "../blocknote";
import { BlockNoteEditorOptions } from "@blocknote/core";
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
  SuggestionMenuController,
  useCreateBlockNote,
} from "@blocknote/react";
import { multiColumnDropCursor } from "@blocknote/xl-multi-column";
import { ReactivueChild } from "@xwiki/cristal-reactivue";
import React from "react";

type DefaultEditorOptionsType = BlockNoteEditorOptions<
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
>;

/**
 * Properties for the {@link BlockNoteEditor} component
 */
type BlockNoteViewWrapperProps = {
  blockNoteOptions?: Partial<Omit<DefaultEditorOptionsType, "schema">>;
  theme?: "light" | "dark";
  readonly?: boolean;

  formattingToolbar: ReactivueChild<{
    editor: EditorType;
    currentBlock: BlockType;
  }>;

  formattingToolbarOnlyFor: Array<BlockType["type"]>;

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

/**
 * BlockNote editor wrapper
 */
function BlockNoteViewWrapper({
  blockNoteOptions,
  theme,
  readonly,
  formattingToolbar: CustomFormattingToolbar,
  formattingToolbarOnlyFor,
  linkToolbar: CustomLinkToolbar,
  filePanel: CustomFilePanel,
}: BlockNoteViewWrapperProps) {
  const schema = createBlockNoteSchema();

  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    ...blockNoteOptions,
    // Editor's schema, with custom blocks definition
    schema,
    // Merges the default dictionary with the multi-column dictionary.
    dictionary: createDictionary(),
    // The default drop cursor only shows up above and below blocks - we replace
    // it with the multi-column one that also shows up on the sides of blocks.
    dropCursor: multiColumnDropCursor,
  });

  // Renders the editor instance using a React component.
  return (
    <BlockNoteView
      editor={editor}
      editable={readonly !== true}
      theme={theme}
      // Override some builtin components
      formattingToolbar={false}
      linkToolbar={false}
      filePanel={false}
      slashMenu={false}
    >
      <SuggestionMenuController
        triggerCharacter={"/"}
        getItems={async (query) => querySuggestionsMenuItems(editor, query)}
      />

      <FormattingToolbarController
        formattingToolbar={() => {
          const currentBlock = editor.getTextCursorPosition().block;

          return (
            <FormattingToolbar>
              {formattingToolbarOnlyFor.includes(currentBlock.type) && (
                <CustomFormattingToolbar
                  editor={editor}
                  currentBlock={currentBlock}
                />
              )}
            </FormattingToolbar>
          );
        }}
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

export type { BlockNoteViewWrapperProps, EditorSchema };
export { BlockNoteViewWrapper };
