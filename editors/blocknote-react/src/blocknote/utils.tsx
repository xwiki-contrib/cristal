/**
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

import { BlockNoteEditor, insertOrUpdateBlock } from "@blocknote/core";
import {
  createReactBlockSpec,
  createReactInlineContentSpec,
} from "@blocknote/react";
import { assertUnreachable, objectEntries } from "@xwiki/cristal-fn-utils";
import type {
  CustomBlockConfig,
  CustomInlineContentConfig,
  InlineContentSchema,
  PartialBlock,
  PartialInlineContent,
  PropSchema,
  PropSpec,
  Props,
  StyleSchema,
} from "@blocknote/core";
import type {
  ReactCustomBlockImplementation,
  ReactInlineContentImplementation,
} from "@blocknote/react";
import type {
  GetConcreteMacroParametersType,
  Macro,
  UntypedMacroParameters,
} from "@xwiki/cristal-macros-api";
import type { UniAstToReactJSXConverter } from "@xwiki/cristal-uniast-react-jsx";
import type { ReactNode } from "react";

/**
 * Create a custom block to use in the BlockNote editor
 *
 * @param block - The block specification
 *
 * @returns A block definition
 *
 * @since 0.18
 * @beta
 */
function createCustomBlockSpec<
  const B extends CustomBlockConfig,
  const I extends InlineContentSchema,
  const S extends StyleSchema,
>({
  config,
  implementation,
  slashMenu,
  customToolbar,
}: {
  config: B;
  implementation: ReactCustomBlockImplementation<B, I, S>;
  slashMenu:
    | false
    | {
        title: string;
        aliases?: string[];
        group: string;
        icon: ReactNode;
        default: () => PartialBlock<Record<B["type"], B>>;
      };
  customToolbar: (() => ReactNode) | null;
}) {
  return {
    block: createReactBlockSpec(config, implementation),

    slashMenuEntry: !slashMenu
      ? (false as const)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (editor: BlockNoteEditor<any>) => ({
          title: slashMenu.title,
          aliases: slashMenu.aliases,
          group: slashMenu.group,
          icon: slashMenu.icon,
          onItemClick: () => {
            insertOrUpdateBlock(editor, slashMenu.default());
          },
        }),

    customToolbar,
  };
}

/**
 * Create a custom inilne content to use in the BlockNote editor
 *
 * @param inlineContent - The inline content specification
 *
 * @returns An inline content definition
 *
 * @since 0.20
 * @beta
 */

function createCustomInlineContentSpec<
  const I extends CustomInlineContentConfig,
  const S extends StyleSchema,
>({
  config,
  implementation,
  slashMenu,
  customToolbar,
}: {
  config: I;
  implementation: ReactInlineContentImplementation<I, S>;
  slashMenu:
    | false
    | {
        title: string;
        aliases?: string[];
        group: string;
        icon: ReactNode;
        default: () => PartialInlineContent<Record<I["type"], I>, S>;
      };
  customToolbar: (() => ReactNode) | null;
}) {
  return {
    inlineContent: createReactInlineContentSpec(config, implementation),

    slashMenuEntry: !slashMenu
      ? (false as const)
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (editor: BlockNoteEditor<any>) => ({
          title: slashMenu.title,
          aliases: slashMenu.aliases,
          group: slashMenu.group,
          icon: slashMenu.icon,
          onItemClick: () => {
            editor.insertInlineContent([
              // @ts-expect-error: the AST is dynamically-typed with macros, so the types are incorrect here
              slashMenu.default(),
            ]);
          },
        }),

    customToolbar,
  };
}

/**
 * Name prefix for macro blocks and inline contents in BlockNote
 *
 * @since 0.23
 * @beta
 */
const MACRO_NAME_PREFIX = "Macro_";

/**
 * Description of a macro's inner content
 *
 * @since 0.20
 * @beta
 */
type BlockNoteConcreteMacro = {
  /** Type-erased macro */
  macro: Macro<UntypedMacroParameters>;

  /** Rendering part */
  bnRendering: // Block macro
  | {
        type: "block";
        block: ReturnType<typeof createCustomBlockSpec>;
      }
    // Inline macro
    | {
        type: "inline";
        inlineContent: ReturnType<typeof createCustomInlineContentSpec>;
      };
};

/**
 * Internal context required for macros execution
 *
 * @since 0.23
 * @beta
 */
type ContextForMacros = {
  /**
   * Request the opening of an UI to edit the macro's parameters (e.g. a modal)
   *
   * @param macro - Description of the macro being edited
   * @param params - Current parameters of the macro
   * @param update - Calling this function will replace the existing macro's parameters with the provided ones
   */
  openParamsEditor(
    macro: Macro<UntypedMacroParameters>,
    params: UntypedMacroParameters,
    update: (newProps: UntypedMacroParameters) => void,
  ): void;
};

/**
 * Adapt a macro to be used inside BlockNote.
 *
 * @param args - Informations about the macro to create
 *
 * @returns - The BlockNote-compatible macro
 *
 * @since 0.20
 * @beta
 */
function adaptMacroForBlockNote<Parameters extends UntypedMacroParameters>(
  macro: Macro<Parameters>,
  ctx: ContextForMacros,
  jsxConverter: UniAstToReactJSXConverter,
): BlockNoteConcreteMacro {
  const { name, parameters, renderType, render, slashMenu } = macro;

  // Compute the macro name
  const blockNoteName = `${MACRO_NAME_PREFIX}${name}`;

  const propSchema: Record<
    string,
    PropSpec<boolean | number | string> & { optional?: true }
  > = {};

  for (const [name, { type }] of objectEntries(parameters)) {
    propSchema[name] = {
      type:
        type.type === "string"
          ? "string"
          : type.type === "float"
            ? "number"
            : type.type === "boolean"
              ? "boolean"
              : assertUnreachable(type),
      optional: type.optional,
      default: undefined,
    };
  }

  const getSlashMenu = <T,>(opts: (defaultValue: () => unknown) => T) =>
    slashMenu
      ? {
          title: slashMenu.description,
          group: "Macros",
          icon: "M",
          aliases: [],
          ...opts(() => ({
            // TODO: statically type parameters so that the `type` name cannot be used,
            //       as it would be shadowed here otherwise
            type: `${MACRO_NAME_PREFIX}${name}`,
            props: slashMenu.defaultParameters,
          })),
        }
      : false;

  // Erase macro's type
  const typeErasedMacro = macro as Macro<UntypedMacroParameters>;

  // The rendering function
  const renderMacro = (
    contentRef: (node: HTMLElement | null) => void,
    props: Props<PropSchema>,
    update: (newParams: Props<PropSchema>) => void,
  ) => {
    const openParamsEditor = () =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx.openParamsEditor(typeErasedMacro, props, update as any);

    const uniAst = render(props as GetConcreteMacroParametersType<Parameters>);

    const renderedJsx = jsxConverter.toReactJSX(uniAst, contentRef);

    return renderType === "inline" ? (
      <span style={{ userSelect: "none" }} onDoubleClick={openParamsEditor}>
        {renderedJsx}
      </span>
    ) : (
      <div style={{ userSelect: "none" }} onDoubleClick={openParamsEditor}>
        {renderedJsx}
      </div>
    );
  };

  // Block and inline macros are defined pretty differently, so a bit of logic was computed ahead of time
  // to share it between the two definitions here.
  const bnRendering: BlockNoteConcreteMacro["bnRendering"] =
    renderType === "block"
      ? {
          type: "block",
          block: createCustomBlockSpec({
            config: {
              type: blockNoteName,
              // TODO: when BlockNote supports internal content in custom blocks, set this to "inline" if the macro can have children
              // Tracking issue: https://github.com/TypeCellOS/BlockNote/issues/1540
              content: "none",
              propSchema,
            },
            implementation: {
              render: ({ contentRef, block, editor }) =>
                renderMacro(contentRef, block.props, (newProps) => {
                  editor.updateBlock(block.id, { props: newProps });
                }),
            },
            slashMenu: getSlashMenu((getDefaultValue) => ({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              default: () => getDefaultValue() as any,
            })),
            // TODO: allow macros to define their own toolbar, using a set of provided UI components (buttons, ...)
            customToolbar: null,
          }),
        }
      : {
          type: "inline",
          inlineContent: createCustomInlineContentSpec({
            config: {
              type: blockNoteName,
              // TODO: when BlockNote supports internal content in custom inline contents themselves, set this to "styled" if the macro can have children
              // Tracking issue: https://github.com/TypeCellOS/BlockNote/issues/1540
              content: "none",
              propSchema,
            },
            implementation: {
              render: ({ contentRef, inlineContent, updateInlineContent }) =>
                renderMacro(contentRef, inlineContent.props, (newProps) => {
                  updateInlineContent({
                    type: inlineContent.type,
                    props: newProps,
                    // TODO: make it editable!
                    content: inlineContent.content,
                  });
                }),
            },
            slashMenu: getSlashMenu((getDefaultValue) => ({
              default: () => [
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getDefaultValue() as any,
              ],
            })),
            // TODO: allow macros to define their own toolbar, using a set of provided UI components (buttons, ...)
            customToolbar: null,
          }),
        };

  return { macro: typeErasedMacro, bnRendering };
}

export { MACRO_NAME_PREFIX, adaptMacroForBlockNote, createCustomBlockSpec };
export type { BlockNoteConcreteMacro, ContextForMacros };
