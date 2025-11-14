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

import type { MacroBlock, MacroInlineContent } from "@xwiki/cristal-macros-api";

/**
 * Convert macros' AST to HTML.
 *
 * @since 0.24-rc-1
 * @beta
 */
interface MacrosAstToHtmlConverter {
  /**
   * Render a macro's AST blocks to an HTML string.
   *
   * @param blocks - The blocks to render
   * @param body - Body of the macro
   *
   * @returns The HTML render
   */
  blocksToHTML(blocks: MacroBlock[], body: MacrosAstToHtmlBody): string | Error;

  /**
   * Render a macro's AST inline contents to an HTML string.
   *
   * @param inlineContents - The inline contents to render
   * @param body - Body of the macro
   *
   * @returns The HTML render
   */
  inlineContentsToHTML(
    inlineContents: MacroInlineContent[],
    body: MacrosAstToHtmlBody,
  ): string | Error;
}

/**
 * Body provided to macros for rendering to HTML
 *
 * @since 0.24-rc-1
 * @beta
 */
type MacrosAstToHtmlBody =
  | {
      /** No body for the macro (for macros with bodyType: "none") */
      type: "none";
    }
  | {
      /** Raw body (for macros with bodyType: "raw") */
      type: "raw";
      content: string;
    }
  | {
      /** HTML-converted body (for macros with bodyType: "wysiwyg") */
      type: "html";
      html: string;
    };

export type { MacrosAstToHtmlBody, MacrosAstToHtmlConverter };
