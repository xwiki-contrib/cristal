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
import { ReactNode } from "react";

export function createCustomBlockSpec<
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
    icon: ReactNode;
    create: () => PartialBlock<{
      [_ in T["type"]]: T;
    }>;
  };
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
  };
}
