import {
  Block,
  BlockNoteEditor,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from "@blocknote/core";

type EditorSchema = DefaultBlockSchema;
type EditorInlineContentSchema = DefaultInlineContentSchema;
type EditorStyleSchema = DefaultStyleSchema;

type EditorType = BlockNoteEditor<
  EditorSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
>;

type BlockType = Block<
  EditorSchema,
  EditorInlineContentSchema,
  EditorStyleSchema
>;

type BlockOfType<B extends BlockType["type"]> = Extract<BlockType, { type: B }>;

export type {
  BlockOfType,
  BlockType,
  EditorInlineContentSchema,
  EditorSchema,
  EditorStyleSchema,
  EditorType,
};
