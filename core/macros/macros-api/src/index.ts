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

import type { MacroAst } from "./ast";

/**
 * Untyped macro parameters
 *
 * @since 0.23
 * @beta
 */
type UntypedMacroParametersType = Record<string, MacroParameterType>;

/**
 * Description of a macro
 *
 * @since 0.23
 * @beta
 */
type Macro<Parameters extends Record<string, MacroParameterType>> = {
  /** Name of the macro */
  name: string;

  /** Description of the macro's parameters */
  parameters: { [P in keyof Parameters]: MacroParameter<Parameters[P]> };

  /**
   * Macro's type
   *
   * `block`: only usable as a block (same level as paragraphs, headings, etc.)
   * `inline`: only usable inside other blocks such as paragraphs
   */
  renderType: "block" | "inline";

  /** Show an entry in the slash menu */
  slashMenu:
    | {
        /** The macro's description */
        description: string;

        /**
         * Default value of every required parameter
         *
         * Optional parameters will be omitted from the default object
         */
        defaultParameters: FilterUndefined<
          GetConcreteMacroParametersType<Parameters>
        >;
      }
    | false;

  /**
   * Render function
   *
   * @param params - The macro's parameters ; optional fields may be absent or equal to `undefined`
   * @param openParamsEditor - Request the opening of an UI to edit the macro's parameters (e.g. a modal)
   *
   * @returns The AST to render the macro as
   */
  render(params: GetConcreteMacroParametersType<Parameters>): MacroAst;
};

/**
 * Description of a macro type
 *
 * @since 0.23
 * @beta
 */
type MacroParameter<T extends MacroParameterType> = {
  // Type of the parameter
  type: T;
  // Description of the parameter (TODO: translations)
  description: string;
};

type MacroParameterType = (
  | { type: "boolean" }
  // We use 'float' instead of 'number' here to make it more explicit to developers
  | { type: "float" }
  | { type: "string" }
) & {
  // Make the parameter optional
  optional?: true;
};

/**
 * Internal utility type to get the concrete TypeScript type from a macro parameter's definition
 */
type GetConcreteMacroParameterType<T extends MacroParameterType> =
  | (T["type"] extends "boolean"
      ? boolean
      : T["type"] extends "float"
        ? number
        : T["type"] extends "string"
          ? string
          : never)
  | (T["optional"] extends true ? undefined : never);

/** Internal utility type making all properties that may be assigned `undefined` optional in a record */
type UndefinableToOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
    T[K],
    undefined
  >;
} & { [K in keyof T as undefined extends T[K] ? never : K]: T[K] };

/**
 * Internal utility type to get the concrete TypeScript record type from a macro's parameters definition
 *
 * Parameters defined as optional are both optional in the output record and can be assigned `undefined`
 */
type GetConcreteMacroParametersType<T extends UntypedMacroParametersType> =
  UndefinableToOptional<{
    [Param in keyof T]: GetConcreteMacroParameterType<T[Param]>;
  }>;

/**Internal utility type to remove values that may be assigned `undefined` from a record */
type FilterUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/**
 * Build a macro, simple handler to ensure type consistency
 *
 * @param macro - The macro to build
 *
 * @returns - The built macro
 *
 * @since 0.23
 */
function buildMacro<Params extends UntypedMacroParametersType>(
  macro: Macro<Params>,
): Macro<Params> {
  return macro;
}

export type {
  FilterUndefined,
  GetConcreteMacroParameterType,
  GetConcreteMacroParametersType,
  Macro,
  MacroParameter,
  MacroParameterType,
  UndefinableToOptional,
  UntypedMacroParametersType,
};

export { buildMacro };

export type * from "./ast";
