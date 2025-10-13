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

/**
 * @since 0.23
 * @beta
 */
type MacroBlock =
  | {
      type: "paragraph";
      styles: MacroBlockStyles;
      content: MacroInlineContent[];
    }
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      content: MacroInlineContent[];
      styles: MacroBlockStyles;
    }
  | {
      type: "list";
      numbered?: boolean;
      items: MacroListItem[];
      styles: MacroBlockStyles;
    }
  | { type: "quote"; content: MacroBlock[]; styles: MacroBlockStyles }
  | { type: "code"; language?: string; content: string }
  | {
      type: "table";
      columns: MacroTableColumn[];
      rows: MacroTableCell[][];
      styles: MacroBlockStyles;
    }
  | ({
      type: "image";
    } & MacroImage)
  | {
      type: "macroBlock";
      name: string;
      params: Record<string, boolean | number | string>;
    }
  | { type: "rawHtml"; html: string }
  | { type: "macroBlockEditableArea" };

/**
 * @since 0.23
 * @beta
 */
type MacroBlockStyles = {
  cssClasses?: string[];
  // TODO: theme's CSS variables
  textColor?: string;
  // TODO: theme's CSS variables
  backgroundColor?: string;
  textAlignment?: MacroAlignment;
};

/**
 * @since 0.23
 * @beta
 */
type MacroAlignment = "left" | "center" | "right" | "justify";

/**
 * @since 0.23
 * @beta
 */
type MacroListItem = {
  checked?: boolean;
  content: MacroBlock[];
  styles: MacroBlockStyles;
};

/**
 * @since 0.23
 * @beta
 */
type MacroImage = {
  target: MacroLinkTarget;
  alt?: string;
  widthPx?: number;
  heightPx?: number;
};

/**
 * @since 0.23
 * @beta
 */
type MacroLink = {
  target: MacroLinkTarget;
  content: Exclude<MacroInlineContent, { type: "link" }>[];
};

/**
 * @since 0.23
 * @beta
 */
type MacroTableColumn = { headerCell?: MacroTableCell; widthPx?: number };

/**
 * @since 0.23
 * @beta
 */
type MacroTableCell = {
  content: MacroInlineContent[];
  styles: MacroBlockStyles;
  rowSpan?: number;
  colSpan?: number;
};

/**
 * @since 0.23
 * @beta
 */
type MacroInlineContent =
  | ({ type: "text" } & MacroText)
  | ({ type: "link" } & MacroLink)
  | { type: "rawHtml"; html: string }
  | {
      type: "inlineMacro";
      name: string;
      params: Record<string, boolean | number | string>;
    }
  | { type: "inlineMacroEditableArea" };

/**
 * @since 0.23
 * @beta
 */
type MacroText = {
  content: string;
  styles: MacroTextStyles;
};

/**
 * @since 0.23
 * @beta
 */
type MacroTextStyles = {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  textColor?: string;
  backgroundColor?: string;
};

/**
 * @since 0.23
 * @beta
 */
type MacroLinkTarget =
  | {
      type: "internal";
      rawReference: string;
    }
  | { type: "external"; url: string };

export type {
  MacroAlignment,
  MacroBlock,
  MacroBlockStyles,
  MacroImage,
  MacroInlineContent,
  MacroLink,
  MacroLinkTarget,
  MacroListItem,
  MacroTableCell,
  MacroTableColumn,
  MacroText,
  MacroTextStyles,
};
