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

import { Block, InlineContent, TableCell, Text, UniAst } from "../ast";

export function uniAstToMarkdown(uniAst: UniAst): string {
  const { blocks } = uniAst;
  const out: string[] = [];

  for (const block of blocks) {
    out.push(blockToMarkdown(block));
  }

  return out.join("\n\n");
}

function blockToMarkdown(block: Block): string {
  switch (block.type) {
    case "paragraph":
      return inlineContentsToMarkdown(block.content);

    case "heading":
      return `${"#".repeat(block.level)} ${inlineContentsToMarkdown(block.content)}`;

    case "bulletListItem":
      return `* ${inlineContentsToMarkdown(block.content)}${block.subItems.map((item) => "\n  " + blockToMarkdown(item)).join("")}`;

    case "numberedListItem":
      return `- ${inlineContentsToMarkdown(block.content)}${block.subItems.map((item) => "\n  " + blockToMarkdown(item)).join("")}`;

    case "checkedListItem":
      return `- [${block.checked ? "x" : " "}] ${inlineContentsToMarkdown(block.content)}${block.subItems.map((item) => "\n  " + blockToMarkdown(item)).join("")}`;

    case "blockQuote":
      return block.content
        .flatMap((block) => blockToMarkdown(block).split("\n"))
        .map((line) => `> ${line}`)
        .join("\n");

    case "codeBlock":
      return `\`\`\`${block.language}\n${block.content}\n\`\`\``;

    case "table":
      return tableToMarkdown(block);

    case "image":
      throw new Error("TODO: images");

    case "macro":
      throw new Error("TODO: macro");
  }
}

function tableToMarkdown(table: Extract<Block, { type: "table" }>): string {
  const { columns, rows } = table;

  const out = [
    columns
      .map((column) =>
        column.headerCell ? tableCellToMarkdown(column.headerCell) : "",
      )
      .join(" | "),
    columns.map(() => " - ").join(" | "),
  ];

  for (const cell of rows) {
    out.push(cell.map(tableCellToMarkdown).join(" | "));
  }

  return out.map((line) => `| ${line} |`).join("\n");
}

function tableCellToMarkdown(cell: TableCell): string {
  return inlineContentsToMarkdown(cell.content);
}

function inlineContentsToMarkdown(inlineContents: InlineContent[]): string {
  return inlineContents.map(inlineContentToMarkdown).join("");
}

function inlineContentToMarkdown(inlineContent: InlineContent): string {
  switch (inlineContent.type) {
    case "text":
      return textToMarkdown(inlineContent.props);

    case "link":
      throw new Error("TODO: links");
  }
}

// eslint-disable-next-line max-statements
function textToMarkdown(text: Text): string {
  const { content, styles } = text;

  const { bold, italic, strikethrough, code } = styles;

  const surroundings = [];

  // Code must be first as it's going to be the most outer surrounding
  // Otherwise other surroundings would be "trapped" inside the inline code content
  if (code) {
    surroundings.push("`");
  }

  if (strikethrough) {
    surroundings.push("~~");
  }

  if (italic) {
    surroundings.push("_");
  }

  if (bold) {
    surroundings.push("**");
  }

  return `${surroundings.join("")}${content}${surroundings.toReversed().join("")}`;
}
