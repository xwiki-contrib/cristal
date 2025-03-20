import { BlockQuote } from "./blocks/BlockQuote";
import { Heading4, Heading5, Heading6 } from "./blocks/Headings";
import {
  Block,
  BlockNoteEditor,
  BlockNoteSchema,
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

function createBlockNoteSchema() {
  // Get rid of some block types
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { checkListItem, audio, video, file, ...remainingBlockSpecs } =
    defaultBlockSpecs;

  return BlockNoteSchema.create({
    blockSpecs: {
      ...remainingBlockSpecs,

      // First-party extension blocks
      // column: ColumnBlock,
      // columnList: ColumnListBlock,

      // Custom blocks
      Heading4: Heading4.block,
      Heading5: Heading5.block,
      Heading6: Heading6.block,
      BlockQuote: BlockQuote.block,
    },
  });
}

function createDictionary(): Dictionary & Record<string, unknown> {
  return {
    ...locales.en,

    // // First-party extensions
    // multi_column: multiColumnLocales.en,
  };
}

function querySuggestionsMenuItems(
  editor: EditorType,
  query: string,
): DefaultReactSuggestionItem[] {
  return filterSuggestionItems(
    combineByGroup(
      getDefaultReactSlashMenuItems(editor),

      // // First-party extension blocks
      // getMultiColumnSlashMenuItems(editor),

      // Custom blocks
      [Heading4, Heading5, Heading6, BlockQuote].map((custom) =>
        custom.slashMenuEntry(editor),
      ),
    ),
    query,
  );
}

type EditorSchema = ReturnType<typeof createBlockNoteSchema>;

type EditorBlockSchema =
  EditorSchema extends BlockNoteSchema<
    infer BlockSchema,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer _,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer __
  >
    ? BlockSchema
    : never;

type EditorInlineContentSchema =
  EditorSchema extends BlockNoteSchema<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer _,
    infer InlineContentSchema,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer __
  >
    ? InlineContentSchema
    : never;

type EditorStyleSchema =
  EditorSchema extends BlockNoteSchema<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer _,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    infer __,
    infer StyleSchema
  >
    ? StyleSchema
    : never;

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
