/*
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

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
import { assertUnreachable } from "@xwiki/cristal-fn-utils";
import { ReactNode } from "react";

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
    icon: ReactNode;
    default: PartialBlock<Record<T["type"], T>>;
  };
  toolbar: () => ReactNode | null;
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
        insertOrUpdateBlock(editor, block.slashMenu.default);
      },
    }),
    toolbar,
  };
}

/**
 * Description of a macro
 *
 * @since 0.20
 */
type Macro = {
  name: string;
  description: string;
  parameters: Record<string, MacroParameterType>;
  renderType: "inline" | "block";
  block: ReturnType<typeof createCustomBlockSpec>;
  hidden: boolean;
};

/**
 * Description of a macro type
 *
 * @since 0.20
 */
type MacroParameterType =
  | { type: "boolean" }
  // | { type: "int" }
  | { type: "float" }
  | { type: "string" }
  | { type: "stringEnum"; possibleValues: string[] };

type GetConcreteMacroParameterType<T extends MacroParameterType> = T extends {
  type: "boolean";
}
  ? boolean
  : // : T extends { type: "int" }
    //   ? number
    T extends { type: "float" }
    ? number
    : T extends { type: "string" }
      ? string
      : T extends { type: "stringEnum" }
        ? T["possibleValues"][number]
        : never;

type GetConcreteMacroParametersType<
  T extends Record<string, MacroParameterType>,
> = {
  [Param in keyof T]: GetConcreteMacroParameterType<T[Param]>;
};

type MacroCreationArgs<Parameters extends Record<string, MacroParameterType>> =
  {
    name: string;
    description: string;
    renderType: "inline" | "block";
    parameters: Parameters;
    defaultParameters: GetConcreteMacroParametersType<Parameters>;
    hidden?: boolean;
    render: (
      parameters: GetConcreteMacroParametersType<Parameters>,
      contentRef: (node: HTMLElement | null) => void,
    ) => React.ReactNode;
  };

const MACRO_NAME_PREFIX = "Macro.";

function createMacro<Parameters extends Record<string, MacroParameterType>>({
  name,
  description,
  parameters,
  defaultParameters,
  hidden,
  render,
  renderType,
}: MacroCreationArgs<Parameters>): Macro {
  return {
    name,
    description,
    parameters,
    hidden: hidden ?? false,
    renderType,
    block: createCustomBlockSpec({
      config: {
        type: `${MACRO_NAME_PREFIX}${name}` as string,
        content: renderType === "inline" ? "none" : "inline",
        propSchema: Object.fromEntries(
          Object.entries(parameters).map(([name, param]) => [
            name,
            {
              type:
                param.type === "string" || param.type === "stringEnum"
                  ? "string"
                  : param.type === "float"
                    ? "number"
                    : param.type === "boolean"
                      ? "boolean"
                      : assertUnreachable(param),
              default: defaultParameters[name],
              values:
                param.type === "stringEnum" ? param.possibleValues : undefined,
            },
          ]),
        ),
      },
      implementation: {
        render: ({ contentRef, block }) =>
          render(
            block.props as GetConcreteMacroParametersType<Parameters>,
            contentRef,
          ),
      },
      slashMenu: {
        title: description,
        group: "Macros",
        icon: "M",
        aliases: [],
        default: {
          // TODO: using the 'type' property in parameters will make it disappear
          ...defaultParameters,
          type: `${MACRO_NAME_PREFIX}${name}`,
        },
      },
      // TODO
      toolbar: () => null,
    }),
  };
}

export { MACRO_NAME_PREFIX, createCustomBlockSpec, createMacro };
export type { Macro, MacroCreationArgs, MacroParameterType };
