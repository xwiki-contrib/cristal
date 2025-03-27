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

import { BlockType, EditorInlineContentSchema, EditorStyleSchema } from ".";
import {
  Block,
  BlockStyles,
  InlineContent,
  TableCell,
  Text,
  UniAst,
} from "../uniast/ast";
import {
  Link,
  StyledText,
  TableCell as BlockNoteTableCell,
} from "@blocknote/core";

export function blocksToUniAst(blocks: BlockType[]): UniAst {
  return {
    blocks: blocks.map(convertBlock),
  };
}

function convertBlock(block: BlockType): Block {
  const dontExpectChildren = () => {
    if (block.children.length > 0) {
      console.error({ unexpextedChildrenInBlock: block });
      throw new Error("Unexpected children in block");
    }
  };

  switch (block.type) {
    case "paragraph":
      dontExpectChildren();

      return {
        type: "paragraph",
        content: block.content.map(convertInlineContent),
        styles: convertBlockStyles(block.props),
      };

    case "heading":
      dontExpectChildren();

      return {
        type: "heading",
        level: block.props.level,
        content: block.content.map(convertInlineContent),
        styles: convertBlockStyles(block.props),
      };

    case "Heading4":
      dontExpectChildren();

      return {
        type: "heading",
        level: 4,
        content: block.content.map(convertInlineContent),
        styles: {}, // TODO
      };

    case "Heading5":
      dontExpectChildren();

      return {
        type: "heading",
        level: 4,
        content: block.content.map(convertInlineContent),
        styles: {}, // TODO
      };

    case "Heading6":
      dontExpectChildren();

      return {
        type: "heading",
        level: 4,
        content: block.content.map(convertInlineContent),
        styles: {}, // TODO
      };

    case "bulletListItem":
      return {
        type: "bulletListItem",
        content: block.content.map(convertInlineContent),
        subItems: block.children.map(convertBlock).map((block) => {
          if (
            block.type !== "bulletListItem" &&
            block.type !== "numberedListItem"
          ) {
            throw new Error(
              "Unexpected child type in list item: " + block.type,
            );
          }

          return block;
        }),
        styles: convertBlockStyles(block.props),
      };

    case "numberedListItem":
      return {
        type: "numberedListItem",
        content: block.content.map(convertInlineContent),
        subItems: block.children.map(convertBlock).map((block) => {
          if (
            block.type !== "bulletListItem" &&
            block.type !== "numberedListItem"
          ) {
            throw new Error(
              "Unexpected child type in list item: " + block.type,
            );
          }

          return block;
        }),
        styles: convertBlockStyles(block.props),
      };

    case "checkListItem":
      return {
        type: "checkedListItem",
        checked: block.props.checked,
        content: block.content.map(convertInlineContent),
        subItems: block.children.map(convertBlock).map((block) => {
          if (
            block.type !== "bulletListItem" &&
            block.type !== "numberedListItem"
          ) {
            throw new Error(
              "Unexpected child type in list item: " + block.type,
            );
          }

          return block;
        }),
        styles: convertBlockStyles(block.props),
      };

    case "codeBlock":
      dontExpectChildren();

      return {
        type: "codeBlock",
        content: block.content
          .map((inline) => {
            if (inline.type !== "text") {
              throw new Error(
                "Unexpected inline element type in code block: " + inline.type,
              );
            }

            return inline.text;
          })
          .join(""),
        language: block.props.language,
      };

    case "BlockQuote":
      dontExpectChildren();

      return {
        type: "blockQuote",
        content: [
          {
            type: "paragraph",
            content: block.content.map(convertInlineContent),
            styles: {},
          },
        ],
        styles: convertBlockStyles(block.props),
      };

    case "image":
      dontExpectChildren();

      return {
        type: "image",
        target: {
          // TODO: support internal
          type: "external",
          url: block.props.url,
        },
        caption: block.props.caption,
        widthPx: block.props.previewWidth,
        styles: { alignment: block.props.textAlignment },
      };

    case "table": {
      dontExpectChildren();

      const [header, ...rows] = block.content.rows;

      return {
        type: "table",
        columns: header.cells.map((cell, i) => ({
          headerCell: convertTableCell(cell),
          widthPx: block.content.columnWidths[i],
        })),
        rows: rows.map((row) => row.cells.map(convertTableCell)),
        styles: convertBlockStyles(block.props),
      };
    }
  }
}

function convertBlockStyles(styles: BlockStyles): BlockStyles {
  // Remove unneeded properties
  const { textAlignment, backgroundColor, textColor } = styles;
  return { textAlignment, backgroundColor, textColor };
}

function convertTableCell(
  cell:
    | (StyledText<EditorStyleSchema> | Link<EditorStyleSchema>)[]
    | BlockNoteTableCell<EditorInlineContentSchema, EditorStyleSchema>,
): TableCell {
  return Array.isArray(cell)
    ? {
        content: cell.map(convertInlineContent),
        styles: {},
      }
    : {
        content: cell.content.map(convertInlineContent),
        styles: convertBlockStyles(cell.props),
        colSpan: cell.props.colspan,
        rowSpan: cell.props.rowspan,
      };
}

function convertInlineContent(
  inlineContent: StyledText<EditorStyleSchema> | Link<EditorStyleSchema>,
): InlineContent {
  switch (inlineContent.type) {
    case "text":
      return {
        type: "text",
        props: convertText(inlineContent),
      };

    case "link":
      return {
        type: "link",
        content: inlineContent.content.map(convertText),
        target: {
          // TODO: internal links
          type: "external",
          url: inlineContent.href,
        },
      };
  }
}

function convertText(text: StyledText<EditorStyleSchema>): Text {
  const { bold, italic, underline, strike, code, backgroundColor, textColor } =
    text.styles;

  return {
    content: text.text,
    styles: {
      bold: bold ?? false,
      italic: italic ?? false,
      underline: underline ?? false,
      strikethrough: strike ?? false,
      code: code ?? false,
      backgroundColor,
      textColor,
    },
  };
}
