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
import { ConverterContext } from "../interface";
import { Lexer, MarkedToken, Token } from "marked";

export class MarkdownToUniAstConverter {
  constructor(public context: ConverterContext) {}

  parseMarkdown(markdown: string): UniAst {
    const tokens = new Lexer().lex(markdown);

    return {
      blocks: tokens.flatMap(this.tokenToBlock),
    };
  }

  private tokenToBlock(marked: Token): Block[] {
    const token = marked as MarkedToken;

    switch (token.type) {
      case "paragraph":
        return [
          {
            type: "paragraph",
            content: this.tokenChildrenToInline(token, {}),
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
            content: this.tokenChildrenToInline(token, {}),
            styles: {},
          },
        ];

      case "blockquote":
        return [
          {
            type: "blockQuote",
            content: token.tokens.flatMap(this.tokenToBlock),
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
        return token.items.map((item, i) =>
          this.listItemToBlock(item, i, token),
        );

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
                content: this.tokenChildrenToInline(cell, {}),
                styles: {
                  textAlignment: cell.align ?? undefined,
                },
              },
            })),
            rows: token.rows.map((row) =>
              row.map<TableCell>((row) => ({
                content: this.tokenChildrenToInline(row, {}),
                styles: {
                  textAlignment: row.align ?? undefined,
                },
              })),
            ),
            styles: {},
          },
        ];

      case "image": {
        // TODO: parse XWiki's specific internal images syntax

        const reference = this.context.parseReferenceFromUrl(token.href);

        // TODO: "token.text" property
        return [
          {
            type: "image",
            target: reference
              ? { type: "internal", reference }
              : { type: "external", url: token.href },
            caption: token.title ?? undefined,
            styles: {},
          },
        ];
      }

      case "space":
        return [];

      // NOTE: These are handled in the `tokenToInline` function below
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
  private listItemToBlock(
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
        this.listItemToBlock(item, i, lastItem),
      ); // TODO
    } else {
      tokens = item.tokens;
      subItems = [];
    }

    const content = this.tokenChildrenToInline({ tokens }, {});

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

  private tokenChildrenToInline(
    token: { tokens?: Token[] },
    styles: TextStyles,
  ): InlineContent[] {
    return (
      token.tokens?.flatMap((child) => this.tokenToInline(child, styles)) ?? []
    );
  }

  private tokenToInline(marked: Token, styles: TextStyles): InlineContent[] {
    const token = marked as MarkedToken;

    switch (token.type) {
      // NOTE: These blocks are handled in a function above
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
        return this.tokenChildrenToInline(token, { ...styles, bold: true });

      case "em":
        return this.tokenChildrenToInline(token, { ...styles, italic: true });

      case "del":
        return this.tokenChildrenToInline(token, {
          ...styles,
          strikethrough: true,
        });

      case "codespan":
        return [
          {
            type: "text",
            props: { content: token.text, styles: {} },
          },
        ];

      case "text":
        return token.tokens
          ? this.tokenChildrenToInline(token, styles)
          : [{ type: "text", props: { content: token.text, styles } }];

      case "def":
        throw new Error("Unsupported inline element: <def>");

      case "html":
        throw new Error("TODO: html");

      case "escape":
        return [{ type: "text", props: { content: token.text, styles } }];

      case "link": {
        // TODO: parse XWiki's specific internal images syntax

        const reference = this.context.parseReferenceFromUrl(token.href);

        return [
          {
            type: "link",
            content: this.tokenChildrenToInline(token, styles).map((token) => {
              if (token.type !== "text") {
                throw new Error(
                  "Unexpected text span in link in markdown parser",
                );
              }

              return token.props;
            }),
            target: reference
              ? { type: "internal", reference }
              : { type: "external", url: token.href },
          },
        ];
      }

      default:
        assertUnreachable(token);
    }
  }
}
