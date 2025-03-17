import { EditorType } from ".";
import {
  BlockNoteEditor,
  CustomBlockConfig,
  InlineContentSchema,
  PartialBlock,
  StyleSchema,
  insertOrUpdateBlock,
} from "@blocknote/core";
import {
  ReactCustomBlockImplementation,
  createReactBlockSpec,
} from "@blocknote/react";
import { ReactElement } from "react";

function createCustomBlockSpec<
  const T extends CustomBlockConfig,
  const I extends InlineContentSchema,
  const S extends StyleSchema,
>(block: {
  config: T;
  implementation: ReactCustomBlockImplementation<T, I, S>;
  slashMenu: {
    title: string;
    aliases?: string[];
    group: string;
    icon: ReactElement;
    create: () => PartialBlock<Record<T["type"], T>>;
  };
  toolbar: () => ReactElement;
}) {
  return {
    block: createReactBlockSpec(block.config, block.implementation),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slashMenuEntry: (editor: BlockNoteEditor<any>) => ({
      title: block.slashMenu.title,
      aliases: block.slashMenu.aliases,
      group: block.slashMenu.group,
      icon: block.slashMenu.icon,
      onItemClick: () => {
        insertOrUpdateBlock(editor, block.slashMenu.create());
      },
    }),
    toolbar,
  };
}

function upgradeEditorType(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: BlockNoteEditor<any, any, any>,
): EditorType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return editor as any;
}

export { createCustomBlockSpec, upgradeEditorType };
