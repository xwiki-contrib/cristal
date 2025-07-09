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
import { App } from "./App";
import { XWikiMacroHtmlBlockMacro } from "./blocknote/macros/XWikiMacroHtmlBlock";
import { XWikiMacroInlineHtmlMacro } from "./blocknote/macros/XWikiMacroInlineHtml";
import {
  MACRO_NAME_PREFIX,
  Macro,
  MacroCreationArgs,
  createMacro,
} from "./blocknote/utils";
import { BlockNoteViewWrapperProps } from "./components/BlockNoteViewWrapper";
import { LinkEditionContext } from "./misc/linkSuggest";
import { createRoot } from "react-dom/client";

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

const DEFAULT_MACROS = {
  XWikiMacroHtmlBlock: XWikiMacroHtmlBlockMacro,
  XWikiMacroInlineHtml: XWikiMacroInlineHtmlMacro,
};

export { DEFAULT_MACROS, MACRO_NAME_PREFIX, createMacro, mountBlockNote };
export type {
  BlockNoteViewWrapperProps,
  LinkEditionContext,
  Macro,
  MacroCreationArgs,
};
export * from "./blocknote";
