import { Alert } from "./blocks/Alert";
import {
  Block,
  BlockNoteEditor,
  BlockNoteSchema,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  Dictionary,
  combineByGroup,
  defaultBlockSpecs,
  filterSuggestionItems,
  locales,
} from "@blocknote/core";
import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import {
  ColumnBlock,
  ColumnListBlock,
  getMultiColumnSlashMenuItems,
  locales as multiColumnLocales,
} from "@blocknote/xl-multi-column";

function createBlockNoteSchema(): EditorSchema {
  return BlockNoteSchema.create({
    blockSpecs: {
      ...defaultBlockSpecs,

      // First-party extension blocks
      column: ColumnBlock,
      columnList: ColumnListBlock,

      // Custom blocks
      alert: Alert.block,
    },
  });
}

function createDictionary(): Dictionary & Record<string, unknown> {
  return {
    ...locales.en,

    // First-party extensions
    multi_column: multiColumnLocales.en,
  };
}

function querySuggestionsMenuItems(
  editor: EditorType,
  query: string,
): DefaultReactSuggestionItem[] {
  return filterSuggestionItems(
    combineByGroup(
      getDefaultReactSlashMenuItems(editor),

      // First-party extension blocks
      getMultiColumnSlashMenuItems(editor),

      // Custom blocks
      [Alert.slashMenuEntry(editor)],
    ),
    query,
  );
}

type EditorSchema = BlockNoteSchema<
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
>;

type EditorBlockSchema = DefaultBlockSchema & {
  // First-party extension blocks
  column: typeof ColumnBlock.config;
  columnList: typeof ColumnListBlock.config;

  // Custom blocks
  alert: typeof Alert.block.config;
};

type EditorInlineContentSchema = DefaultInlineContentSchema;

type EditorStyleSchema = DefaultStyleSchema;

type EditorType = BlockNoteEditor<
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
>;

type BlockType = Block<
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
>;

type BlockOfType<B extends BlockType["type"]> = Extract<BlockType, { type: B }>;

export type {
  BlockOfType,
  BlockType,
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorSchema,
  EditorStyleSchema,
  EditorType,
};

export { createBlockNoteSchema, createDictionary, querySuggestionsMenuItems };
