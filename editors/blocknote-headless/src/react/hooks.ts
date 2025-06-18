import {
  EditorBlockSchema,
  EditorInlineContentSchema,
  EditorStyleSchema,
  EditorType,
} from "../blocknote";
import { useBlockNoteEditor } from "@blocknote/react";

export function useEditor(): EditorType {
  return useBlockNoteEditor<
    EditorBlockSchema,
    EditorInlineContentSchema,
    EditorStyleSchema
  >();
}
