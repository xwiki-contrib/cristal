import {
  BlockType,
  EditorInlineContentSchema,
  EditorLink,
  EditorStyleSchema,
  EditorStyledText,
} from ".";
import { Block, BlockStyles, InlineContent, Text, UniAst } from "../uniast/ast";
import { TableCell } from "@blocknote/core";

export function uniAstToBlocks(uniAst: UniAst): BlockType[] {
  return uniAst.blocks.map(convertBlock);
}

function convertBlock(block: Block): BlockType {
  switch (block.type) {
    case "paragraph":
      return {
        type: "paragraph",
        id: genId(),
        children: [],
        content: block.content.map(convertInlineContent),
        props: convertBlockStyles(block.styles),
      };

    case "heading":
      switch (block.level) {
        case 1:
        case 2:
        case 3:
          return {
            type: "heading",
            id: genId(),
            children: [],
            content: block.content.map(convertInlineContent),
            props: { ...convertBlockStyles(block.styles), level: block.level },
          };

        case 4:
          return {
            type: "Heading4",
            id: genId(),
            children: [],
            content: block.content.map(convertInlineContent),
            props: convertBlockStyles(block.styles),
          };

        case 5:
          return {
            type: "Heading5",
            id: genId(),
            children: [],
            content: block.content.map(convertInlineContent),
            props: convertBlockStyles(block.styles),
          };

        case 6:
          return {
            type: "Heading6",
            id: genId(),
            children: [],
            content: block.content.map(convertInlineContent),
            props: convertBlockStyles(block.styles),
          };
      }

      break;

    case "blockQuote":
      return {
        type: "BlockQuote",
        id: genId(),
        children: [],
        content: convertCustomBlockContent(block.content),
        props: convertBlockStyles(block.styles),
      };

    case "codeBlock":
      return {
        type: "codeBlock",
        id: genId(),
        children: [],
        content: [
          {
            type: "text",
            text: block.content,
            styles: {},
          },
        ],
        props: {
          language: block.language ?? "",
        },
      };

    case "bulletListItem":
      return {
        type: "bulletListItem",
        id: genId(),
        children: block.subItems.map(convertBlock),
        content: block.content.map(convertInlineContent),
        props: convertBlockStyles(block.styles),
      };

    case "numberedListItem":
      return {
        type: "numberedListItem",
        id: genId(),
        children: block.subItems.map(convertBlock),
        content: block.content.map(convertInlineContent),
        props: {
          ...convertBlockStyles(block.styles),
          // TODO
          start: 0,
        },
      };

    case "checkedListItem":
      return {
        type: "checkListItem",
        id: genId(),
        children: block.subItems.map(convertBlock),
        content: block.content.map(convertInlineContent),
        props: { ...convertBlockStyles(block.styles), checked: block.checked },
      };

    case "table":
      return {
        type: "table",
        id: genId(),
        content: {
          type: "tableContent",
          columnWidths: block.columns.map((col) => col.widthPx),
          rows: block.rows.map((cells) => ({
            cells: cells.map(
              (cell) =>
                ({
                  type: "tableCell",
                  content: cell.content.map(convertInlineContent),
                  props: {
                    ...convertBlockStyles(cell.styles),
                    colspan: cell.colSpan,
                    rowspan: cell.rowSpan,
                  },
                }) satisfies TableCell<
                  EditorInlineContentSchema,
                  EditorStyleSchema
                >,
            ),
          })),
        },
        children: [],
        props: {
          // TODO (?)
          textColor: "default",
        },
      };

    case "image":
      if (block.target.type !== "external") {
        throw new Error("TODO: handle internal links");
      }

      return {
        type: "image",
        id: genId(),
        children: [],
        content: undefined,
        props: {
          url: block.target.url,
          caption: block.caption ?? "",
          showPreview: true,
          previewWidth: block.widthPx ?? 0,
          backgroundColor: "default",
          textAlignment: block.styles.alignment ?? "left",
          // TODO (?)
          name: "",
        },
      };

    case "macro":
      throw new Error("TODO: macro");
  }
}

function convertCustomBlockContent(
  content: Block[],
): Array<EditorStyledText | EditorLink> {
  if (content.length > 1 || content[0].type !== "paragraph") {
    throw new Error("Expected a single paragraph inside custom block");
  }

  // TODO: styles
  return content[0].content.map(convertInlineContent);
}

function convertBlockStyles(styles: BlockStyles) {
  return {
    backgroundColor: styles.backgroundColor ?? "default",
    textColor: styles.textColor ?? "default",
    textAlignment: styles.textAlignment ?? "left",
  };
}

function convertInlineContent(
  inlineContent: InlineContent,
): EditorStyledText | EditorLink {
  switch (inlineContent.type) {
    case "text":
      return convertText(inlineContent.props);

    case "link":
      if (inlineContent.target.type !== "external") {
        throw new Error("TODO: handle internal links");
      }

      return {
        type: "link",
        content: inlineContent.content.map(convertText),
        href: inlineContent.target.url,
      };
  }
}

function convertText(text: Text): EditorStyledText {
  return {
    type: "text",
    text: text.content,
    styles: text.styles,
  };
}

function genId(): string {
  return Math.random().toString();
}
