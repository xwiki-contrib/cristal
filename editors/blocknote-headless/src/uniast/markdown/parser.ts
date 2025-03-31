import { assertInArray, assertUnreachable } from "../../utils";
import {
  Block,
  InlineContent,
  ListItem,
  TableCell,
  TableColumn,
  TextStyles,
  UniAst,
} from "../ast";
import { Lexer, MarkedToken, Token } from "marked";

export function markdownToUniAst(markdown: string): UniAst {
  const tokens = new Lexer().lex(markdown);

  return {
    blocks: tokens.flatMap(tokenToBlock),
  };
}

function tokenToBlock(marked: Token): Block[] {
  const token = marked as MarkedToken;

  switch (token.type) {
    case "paragraph":
      return [
        {
          type: "paragraph",
          content: tokenChildrenToInline(token, {}),
          styles: {},
        },
      ];

    case "heading":
      return [
        {
          type: "heading",
          level: assertInArray(
            token.depth,
            [1, 2, 3, 4, 5, 6] as const,
            "Invalid heading depth in markdown parser",
          ),
          content: tokenChildrenToInline(token, {}),
          styles: {},
        },
      ];

    case "blockquote":
      return [
        {
          type: "blockQuote",
          content: token.tokens.flatMap(tokenToBlock),
          styles: {},
        },
      ];

    case "br":
      // TODO
      return [];

    case "hr":
      // TODO
      return [];

    case "list":
      // TODO: "token.loose" property
      return token.items.map((item, i) => listItemToBlock(item, i, token));

    case "list_item":
      throw new Error('Unexpected "list_item" element in markdown parser');

    case "code":
      // TODO: "token.escaped" property
      // TODO: "token.codeBlockStyle" property
      return [
        {
          type: "codeBlock",
          content: token.text,
          language: token.lang,
        },
      ];

    case "table":
      return [
        {
          type: "table",
          columns: token.header.map<TableColumn>((cell) => ({
            headerCell: {
              content: tokenChildrenToInline(cell, {}),
              styles: {
                textAlignment: cell.align ?? undefined,
              },
            },
          })),
          rows: token.rows.map((row) =>
            row.map<TableCell>((row) => ({
              content: tokenChildrenToInline(row, {}),
              styles: {
                textAlignment: row.align ?? undefined,
              },
            })),
          ),
          styles: {},
        },
      ];

    case "image":
      // TODO: "token.text" property
      return [
        {
          type: "image",
          // TODO: internal
          target: {
            type: "external",
            url: token.href,
          },
          caption: token.title ?? undefined,
          styles: {},
        },
      ];

    case "space":
      return [];

    case "strong":
    case "em":
    case "del":
    case "codespan":
    case "text":
    case "def":
    case "html":
    case "escape":
    case "link":
      throw new Error(
        "Unexpected block type in markdown parser: " + token.type,
      );

    default:
      assertUnreachable(token);
  }
}

// eslint-disable-next-line max-statements
function listItemToBlock(
  item: Extract<MarkedToken, { type: "list_item" }>,
  itemIndex: number,
  parentList: Extract<MarkedToken, { type: "list" }>,
): ListItem {
  let tokens: Token[];
  let subItems: ListItem[];

  const lastItem = item.tokens[item.tokens.length - 1] as
    | MarkedToken
    | undefined;

  if (lastItem?.type === "list") {
    tokens = item.tokens.slice(0, item.tokens.length - 1);
    subItems = lastItem.items.map((item, i) =>
      listItemToBlock(item, i, lastItem),
    ); // TODO
  } else {
    tokens = item.tokens;
    subItems = [];
  }

  const content = tokenChildrenToInline({ tokens }, {});

  if (item.task) {
    return {
      type: "checkedListItem",
      checked: item.checked ?? false,
      content,
      subItems,
      styles: {},
    };
  }

  if (parentList.ordered) {
    return {
      type: "numberedListItem",
      number: (parentList.start || 1) + itemIndex,
      content,
      subItems,
      styles: {},
    };
  }

  return {
    type: "bulletListItem",
    content,
    subItems,
    styles: {},
  };
}

function tokenChildrenToInline(
  token: { tokens?: Token[] },
  styles: TextStyles,
): InlineContent[] {
  return token.tokens?.flatMap((child) => tokenToInline(child, styles)) ?? [];
}

function tokenToInline(marked: Token, styles: TextStyles): InlineContent[] {
  const token = marked as MarkedToken;

  switch (token.type) {
    case "paragraph":
    case "heading":
    case "table":
    case "blockquote":
    case "br":
    case "hr":
    case "list":
    case "list_item":
    case "space":
    case "code":
    case "image":
      console.error({ token });
      throw new Error(
        "Unexpected inline type in markdown parser: " + token.type,
      );

    case "strong":
      return tokenChildrenToInline(token, { ...styles, bold: true });

    case "em":
      return tokenChildrenToInline(token, { ...styles, italic: true });

    case "del":
      return tokenChildrenToInline(token, { ...styles, strikethrough: true });

    case "codespan":
      return [
        {
          type: "text",
          props: { content: token.text, styles: {} },
        },
      ];

    case "text":
      return token.tokens
        ? tokenChildrenToInline(token, styles)
        : [{ type: "text", props: { content: token.text, styles } }];

    case "def":
      throw new Error("Unsupported inline element: <def>");

    case "html":
      throw new Error("TODO: html");

    case "escape":
      return [{ type: "text", props: { content: token.text, styles } }];

    case "link":
      return [
        {
          type: "link",
          content: tokenChildrenToInline(token, styles).map((token) => {
            if (token.type !== "text") {
              throw new Error(
                "Unexpected text span in link in markdown parser",
              );
            }

            return token.props;
          }),
          target: { type: "external", url: token.href },
        },
      ];

    default:
      assertUnreachable(token);
  }
}
