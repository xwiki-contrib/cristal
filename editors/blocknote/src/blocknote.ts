import {
  Block,
  BlockNoteEditor,
  BlockNoteSchema,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from "@blocknote/core";
import {
  ColumnBlock,
  ColumnListBlock,
  withMultiColumn,
} from "@blocknote/xl-multi-column";

function createBlockNoteSchema(): EditorSchema {
  return withMultiColumn(BlockNoteSchema.create());
}

type EditorSchema = BlockNoteSchema<
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
>;

type EditorBlockSchema = DefaultBlockSchema & {
  column: typeof ColumnBlock.config;
  columnList: typeof ColumnListBlock.config;
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

export { createBlockNoteSchema };
