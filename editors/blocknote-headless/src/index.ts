import { createBlockNoteSchema } from "./blocknote";
import { BlockNoteToUniAstConverter } from "./blocknote/bn-to-uniast";
import { UniAstToBlockNoteConverter } from "./blocknote/uniast-to-bn";
import BlocknoteEditor from "./vue/c-blocknote-view.vue";
import type { EditorType } from "./blocknote";

export {
  BlockNoteToUniAstConverter,
  BlocknoteEditor,
  UniAstToBlockNoteConverter,
  createBlockNoteSchema,
};

export type { EditorType };
