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
  CustomInlineContentConfig,
  InlineContentSchema,
  PartialBlock,
  PartialInlineContent,
  PropSchema,
  StyleSchema,
  insertOrUpdateBlock,
} from "@blocknote/core";
import {
  ReactCustomBlockImplementation,
  ReactInlineContentImplementation,
  createReactBlockSpec,
  createReactInlineContentSpec,
} from "@blocknote/react";
import { assertUnreachable } from "@xwiki/cristal-fn-utils";
import { ReactNode } from "react";

function createCustomBlockSpec<
  const B extends CustomBlockConfig,
  const I extends InlineContentSchema,
  const S extends StyleSchema,
>(block: {
  config: B;
  implementation: ReactCustomBlockImplementation<B, I, S>;
  slashMenu: {
    title: string;
    aliases?: string[];
    group: string;
    icon: ReactNode;
    default: PartialBlock<Record<B["type"], B>>;
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

function createCustomInlineContentSpec<
  const I extends CustomInlineContentConfig,
  const S extends StyleSchema,
>(inlineContent: {
  config: I;
  implementation: ReactInlineContentImplementation<I, S>;
  slashMenu: {
    title: string;
    aliases?: string[];
    group: string;
    icon: ReactNode;
    default: PartialInlineContent<Record<I["type"], I>, S>;
  };
  toolbar: () => ReactNode | null;
}) {
  return {
    inlineContent: createReactInlineContentSpec(
      inlineContent.config,
      inlineContent.implementation,
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slashMenuEntry: (editor: BlockNoteEditor<any>) => ({
      title: inlineContent.slashMenu.title,
      aliases: inlineContent.slashMenu.aliases,
      group: inlineContent.slashMenu.group,
      icon: inlineContent.slashMenu.icon,
      onItemClick: () => {
        editor.insertInlineContent([
          // @ts-expect-error: TODO
          inlineContent.slashMenu.default,
        ]);
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

  hidden: boolean;
  hasChildren: boolean;
} & MacroConcrete;

/**
 * Description of a macro's inner content
 *
 * @since 0.20
 */
type MacroConcrete =
  | { type: "block"; block: ReturnType<typeof createCustomBlockSpec> }
  | {
      type: "inline";
      inlineContent: ReturnType<typeof createCustomInlineContentSpec>;
    };

/**
 * Description of a macro type
 *
 * @since 0.20
 */
type MacroParameterType = (
  | { type: "boolean" }
  // | { type: "int" }
  | { type: "float" }
  | { type: "string" }
  | { type: "stringEnum"; possibleValues: string[] }
) & { optional?: true };

type GetConcreteMacroParameterType<T extends MacroParameterType> =
  | (T extends {
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
            : never)
  | (T["optional"] extends true ? undefined : never);

type UndefinableToOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
    T[K],
    undefined
  >;
} & { [K in keyof T as undefined extends T[K] ? never : K]: T[K] };

type GetConcreteMacroParametersType<
  T extends Record<string, MacroParameterType>,
> = UndefinableToOptional<{
  [Param in keyof T]: GetConcreteMacroParameterType<T[Param]>;
}>;

type FilterUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

type MacroCreationArgs<Parameters extends Record<string, MacroParameterType>> =
  {
    name: string;
    description: string;
    renderType: "inline" | "block";
    parameters: Parameters;
    defaultParameters: FilterUndefined<
      GetConcreteMacroParametersType<Parameters>
    >;
    hasChildren: boolean;
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
  hasChildren,
  hidden,
  render,
  renderType,
}: MacroCreationArgs<Parameters>): Macro {
  const type = `${MACRO_NAME_PREFIX}${name}` as string;

  const propSchema: PropSchema = Object.fromEntries(
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
        default:
          name in defaultParameters
            ? // TODO: comment typecast
              (defaultParameters as Record<string, string>)[name]
            : undefined,
        optional: param.optional,
        values: param.type === "stringEnum" ? param.possibleValues : undefined,
      },
    ]),
  );

  const slashMenu = {
    title: description,
    group: "Macros",
    icon: "M",
    aliases: [],
  };

  const defaultValue = {
    // TODO: using the 'type' property in parameters will make it disappear
    ...defaultParameters,
    type: `${MACRO_NAME_PREFIX}${name}`,
  };

  const concreteMacro: MacroConcrete =
    renderType === "block"
      ? {
          type: "block",
          block: createCustomBlockSpec({
            config: {
              type,
              content: hasChildren ? "inline" : "none",
              propSchema,
            },
            implementation: {
              render: ({ contentRef, block }) =>
                render(
                  block.props as GetConcreteMacroParametersType<Parameters>,
                  contentRef,
                ),
            },
            slashMenu: {
              ...slashMenu,
              default: defaultValue,
            },
            // TODO
            toolbar: () => null,
          }),
        }
      : {
          type: "inline",
          inlineContent: createCustomInlineContentSpec({
            config: {
              type,
              content: hasChildren ? "styled" : "none",
              propSchema,
            },
            implementation: {
              render: ({ contentRef, inlineContent }) =>
                render(
                  inlineContent.props as GetConcreteMacroParametersType<Parameters>,
                  contentRef,
                ),
            },
            slashMenu: {
              ...slashMenu,
              default: [defaultValue],
            },
            // TODO
            toolbar: () => null,
          }),
        };

  return {
    name,
    description,
    parameters,
    hasChildren,
    hidden: hidden ?? false,
    renderType,
    ...concreteMacro,
  };
}

export { MACRO_NAME_PREFIX, createCustomBlockSpec, createMacro };
export type { Macro, MacroCreationArgs, MacroParameterType };
