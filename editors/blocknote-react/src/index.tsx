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
import { App } from "./App";
import {
  ErrorMacro,
  InfoMacro,
  WarnMacro,
} from "./blocknote/macros/AlertMacros";
import { XWikiMacroHTMLBlockMacro } from "./blocknote/macros/XWikiMacroHtmlBlockMacro";
import { XWikiMacroInlineHTMLMacro } from "./blocknote/macros/XWikiMacroInlineHtmlMacro";
import { MACRO_NAME_PREFIX, createMacro } from "./blocknote/utils";
import { createRoot } from "react-dom/client";
import type {
  BuildableMacro,
  ContextForMacros,
  Macro,
  MacroCreationArgs,
  MacroParameterType,
} from "./blocknote/utils";
import type { BlockNoteViewWrapperProps } from "./components/BlockNoteViewWrapper";
import type { LinkEditionContext } from "./misc/linkSuggest";

/**
 * Mount a BlockNote editor inside a DOM container
 *
 * @param containerEl - The container to put BlockNote in (must be empty and be a block type component, e.g. `<div>`)
 * @param props - Properties to setup the editor with
 *
 * @returns - An unmount function to properly dispose of the editor
 *
 * @since 0.19
 * @beta
 */
function mountBlockNote(
  containerEl: HTMLElement,
  props: BlockNoteViewWrapperProps,
): { unmount: () => void } {
  const root = createRoot(containerEl);

  root.render(<App {...props} />);

  let unmounted = false;

  return {
    unmount() {
      if (unmounted) {
        throw new Error("BlockNote is already unmounted!");
      }

      unmounted = true;
      root.unmount();
    },
  };
}

/**
 * A set of default macros to use in BlockNote
 *
 * These are not enabled by default as some integrations may want to fully disable macros support.
 * In such case, simply ignore this.
 *
 * Otherwise, you can provide this object's values entirely or select only a few macros and pass them to the setup function.
 * @since 0.20
 * @beta
 */
const DEFAULT_MACROS = {
  XWikiMacroHTMLBlockMacro,
  XWikiMacroInlineHTMLMacro,
  InfoMacro,
  WarnMacro,
  ErrorMacro,
};

export { DEFAULT_MACROS, MACRO_NAME_PREFIX, createMacro, mountBlockNote };

export type {
  BlockNoteViewWrapperProps,
  BuildableMacro,
  ContextForMacros,
  LinkEditionContext,
  Macro,
  MacroCreationArgs,
  MacroParameterType,
};

export * from "./blocknote";
