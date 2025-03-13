import {
  BlockType,
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorSchema,
  EditorStyleSchema,
  EditorType,
  createBlockNoteSchema,
} from "../blocknote";
import {
  BlockNoteEditorOptions,
  combineByGroup,
  filterSuggestionItems,
  locales,
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
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  getMultiColumnSlashMenuItems,
  locales as multiColumnLocales,
  multiColumnDropCursor,
} from "@blocknote/xl-multi-column";
import { ReactivueChild } from "@xwiki/cristal-reactivue";
import React, { useMemo } from "react";

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
  linkToolbar: CustomLinkToolbar,
  filePanel: CustomFilePanel,
}: BlockNoteViewWrapperProps) {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    ...blockNoteOptions,
    schema: createBlockNoteSchema(),
    // The default drop cursor only shows up above and below blocks - we replace
    // it with the multi-column one that also shows up on the sides of blocks.
    dropCursor: multiColumnDropCursor,
    // Merges the default dictionary with the multi-column dictionary.
    dictionary: {
      ...locales.en,
      multi_column: multiColumnLocales.en,
    },
  });

  const getSlashMenuItems = useMemo(() => {
    return async (query: string) =>
      filterSuggestionItems(
        combineByGroup(
          getDefaultReactSlashMenuItems(editor),
          getMultiColumnSlashMenuItems(editor),
        ),
        query,
      );
  }, [editor]);

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
        getItems={getSlashMenuItems}
      />

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

export type { BlockNoteViewWrapperProps, EditorSchema };
export { BlockNoteViewWrapper };
