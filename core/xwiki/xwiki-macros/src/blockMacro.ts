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
import { buildMacro, castMacroAsGeneric } from "@xwiki/cristal-macros-api";
import type {
  Macro,
  UntypedMacroParametersType,
} from "@xwiki/cristal-macros-api";

export const XWikiBlockHtmlMacro: Macro<UntypedMacroParametersType> =
  castMacroAsGeneric(
    buildMacro({
      name: "xwikiBlockHtml",
      parameters: {
        html: {
          type: { type: "string" },
          description: "Rendered HTML of an XWiki macro",
        },
        metadata: {
          type: { type: "string" },
          description: "Raw metadata string for an XWiki macro",
        },
      },
      render: {
        as: "block",
        render: ({ html }) => [{ type: "rawHtml", html }],
      },
      slashMenu: false,
    }),
  );
