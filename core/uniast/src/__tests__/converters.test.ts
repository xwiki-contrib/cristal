import { UniAst } from "../ast";
import { ConverterContext, createConverterContext } from "../interface";
import { MarkdownToUniAstConverter } from "../markdown/md-to-uniast";
import { UniAstToMarkdownConverter } from "../markdown/uniast-to-md";
import {
  ModelReferenceHandlerProvider,
  ModelReferenceParserProvider,
  ModelReferenceSerializerProvider,
} from "@xwiki/cristal-model-reference-api";
import {
  RemoteURLParserProvider,
  RemoteURLSerializerProvider,
} from "@xwiki/cristal-model-remote-url-api";
import { Container } from "inversify";
import { describe, expect, test } from "vitest";
import { mock } from "vitest-mock-extended";

// eslint-disable-next-line max-statements
function getConverterContext(): ConverterContext {
  const modelReferenceParserProvider = mock<ModelReferenceParserProvider>();

  const modelReferenceSerializerProvider =
    mock<ModelReferenceSerializerProvider>();

  const remoteURLParserProvider = mock<RemoteURLParserProvider>();

  const remoteURLSerializerProvider = mock<RemoteURLSerializerProvider>();

  const modelReferenceHandlerProvider = mock<ModelReferenceHandlerProvider>();

  const containerMock = mock<Container>();

  containerMock.get
    .calledWith("ModelReferenceParserProvider")
    .mockReturnValue(modelReferenceParserProvider);

  containerMock.get
    .calledWith("ModelReferenceSerializerProvider")
    .mockReturnValue(modelReferenceSerializerProvider);

  containerMock.get
    .calledWith("RemoteURLParserProvider")
    .mockReturnValue(remoteURLParserProvider);

  containerMock.get
    .calledWith("RemoteURLSerializerProvider")
    .mockReturnValue(remoteURLSerializerProvider);

  containerMock.get
    .calledWith("ModelReferenceHandlerProvider")
    .mockReturnValue(modelReferenceHandlerProvider);

  return createConverterContext(containerMock);
}

describe("MarkdownToUniAstConverter", () => {
  const converterContext = getConverterContext();

  const mdToUniAst = new MarkdownToUniAstConverter(converterContext);
  const uniAstToMd = new UniAstToMarkdownConverter(converterContext);

  function testTwoWayConversion(expected: {
    startingFrom: string;
    convertsBackTo: string;
    withUniAst: UniAst;
  }): void {
    const uniAst = mdToUniAst.parseMarkdown(expected.startingFrom);

    expect(uniAst).toStrictEqual(expected.withUniAst);

    if (uniAst instanceof Error) {
      throw new Error("Unreachable");
    }

    expect(uniAstToMd.toMarkdown(uniAst)).toEqual(expected.convertsBackTo);
  }

  // TODO: test inline images + links
  test("parse some text styling", () => {
    testTwoWayConversion({
      startingFrom:
        "Normal **Bold** *Italic1* _Italic2_ ~~Strikethrough~~ __Underline__ `Code` **_~~wow!~~_**",
      convertsBackTo:
        "Normal **Bold** _Italic1_ _Italic2_ ~~Strikethrough~~ **Underline** Code ~~_**wow!**_~~",
      withUniAst: {
        blocks: [
          {
            content: [
              {
                content: "Normal ",
                styles: {},
                type: "text",
              },
              {
                content: "Bold",
                styles: {
                  bold: true,
                },
                type: "text",
              },
              {
                content: " ",
                styles: {},
                type: "text",
              },
              {
                content: "Italic1",
                styles: {
                  italic: true,
                },
                type: "text",
              },
              {
                content: " ",
                styles: {},
                type: "text",
              },
              {
                content: "Italic2",
                styles: {
                  italic: true,
                },
                type: "text",
              },
              {
                content: " ",
                styles: {},
                type: "text",
              },
              {
                content: "Strikethrough",
                styles: {
                  strikethrough: true,
                },
                type: "text",
              },
              {
                content: " ",
                styles: {},
                type: "text",
              },
              {
                content: "Underline",
                styles: {
                  bold: true,
                },
                type: "text",
              },
              {
                content: " ",
                styles: {},
                type: "text",
              },
              {
                content: "Code",
                styles: {},
                type: "text",
              },
              {
                content: " ",
                styles: {},
                type: "text",
              },
              {
                content: "wow!",
                styles: {
                  bold: true,
                  italic: true,
                  strikethrough: true,
                },
                type: "text",
              },
            ],
            styles: {},
            type: "paragraph",
          },
        ],
      },
    });
  });

  test("parse some simple blocks", () => {
    testTwoWayConversion({
      startingFrom: [
        "Paragraph line 1",
        "Paragraph line 2",
        "",
        "# Heading level 1",
        "## Heading level 2",
        "### Heading level 3",
        "#### Heading level 4",
        "##### Heading level 5",
        "###### Heading level 6",
        "> Blockquote line 1",
        "> Blockquote line 2",
        "",
        "> Some separate blockquote",
        "",
        "* Bullet item 1",
        "* Bullet item 2",
        "- Bullet item 3",
        "* Bullet item 4 line 1",
        "  Bullet item 4 line 2",
        "  Bullet item 4 line **3**",
        "",
        "1. Numbered item 1",
        "2. Numbered item 2",
        "3. Numbered item 3",
        "6. Numbered item 6",
        "",
        "2. Another list starting at 2",
        "",
        "- [ ] Unchecked task 1",
        "- [x] Checked task 2",
        "- [X] Checked task 3",
        "",
        "```",
        "Code block 1",
        "```",
        "",
        "```javascript",
        "Code block 2 (js)",
        "```",
        "",
        "| Heading 1 | Heading 2 | Heading **3** |",
        "| --------- | --------- | ------------- |",
        "| Row 1 cell 1 | Row 1 cell 2 | Row 1 cell **3** ",
        "| Row 2 cell 1 | Row 2 cell 2 | Row 2 cell **3** ",
        "| Row 3 cell 1 | Row 3 cell 2 | Row 3 cell **3** ",
        "",
        "![Image alt](http://somewhere.somewhere)",
        "",
        "---",
        "***",
      ].join("\n"),
      convertsBackTo: [
        "Paragraph line 1",
        "Paragraph line 2",
        "",
        "# Heading level 1",
        "",
        "## Heading level 2",
        "",
        "### Heading level 3",
        "",
        "#### Heading level 4",
        "",
        "##### Heading level 5",
        "",
        "###### Heading level 6",
        "",
        "> Blockquote line 1",
        "> Blockquote line 2",
        "",
        "> Some separate blockquote",
        "",
        "* Bullet item 1",
        "* Bullet item 2",
        "",
        // This item ends up isolated as it used another bullet style ('-' instead of '*' in the source)
        "* Bullet item 3",
        "",
        "* Bullet item 4 line 1",
        "  Bullet item 4 line 2",
        "  Bullet item 4 line **3**",
        "",
        "1. Numbered item 1",
        "2. Numbered item 2",
        "3. Numbered item 3",
        "4. Numbered item 6",
        // This item ends up combined to the list above as using a number, even after two line breaks, will make it part of the same list
        "5. Another list starting at 2",
        "",
        "* [ ] Unchecked task 1",
        "* [x] Checked task 2",
        "* [x] Checked task 3",
        "",
        "```",
        "Code block 1",
        "```",
        "",
        "```javascript",
        "Code block 2 (js)",
        "```",
        "",
        "| Heading 1 | Heading 2 | Heading **3** |",
        "|  -  |  -  |  -  |",
        "| Heading 1 | Heading 2 | Heading **3** |",
        "| Row 1 cell 1 | Row 1 cell 2 | Row 1 cell **3** |",
        "| Row 2 cell 1 | Row 2 cell 2 | Row 2 cell **3** |",
        "| Row 3 cell 1 | Row 3 cell 2 | Row 3 cell **3** |",
        "",
        "![Image alt](http://somewhere.somewhere)",
        "",
        "---",
        "",
        "---",
      ].join("\n"),
      withUniAst: {
        blocks: [
          {
            content: [
              {
                content: "Paragraph line 1\nParagraph line 2",
                styles: {},
                type: "text",
              },
            ],
            styles: {},
            type: "paragraph",
          },
          {
            content: [
              {
                content: "Heading level 1",
                styles: {},
                type: "text",
              },
            ],
            level: 1,
            styles: {},
            type: "heading",
          },
          {
            content: [
              {
                content: "Heading level 2",
                styles: {},
                type: "text",
              },
            ],
            level: 2,
            styles: {},
            type: "heading",
          },
          {
            content: [
              {
                content: "Heading level 3",
                styles: {},
                type: "text",
              },
            ],
            level: 3,
            styles: {},
            type: "heading",
          },
          {
            content: [
              {
                content: "Heading level 4",
                styles: {},
                type: "text",
              },
            ],
            level: 4,
            styles: {},
            type: "heading",
          },
          {
            content: [
              {
                content: "Heading level 5",
                styles: {},
                type: "text",
              },
            ],
            level: 5,
            styles: {},
            type: "heading",
          },
          {
            content: [
              {
                content: "Heading level 6",
                styles: {},
                type: "text",
              },
            ],
            level: 6,
            styles: {},
            type: "heading",
          },
          {
            content: [
              {
                content: [
                  {
                    content: "Blockquote line 1\nBlockquote line 2",
                    styles: {},
                    type: "text",
                  },
                ],
                styles: {},
                type: "paragraph",
              },
            ],
            styles: {},
            type: "blockQuote",
          },
          {
            content: [
              {
                content: [
                  {
                    content: "Some separate blockquote",
                    styles: {},
                    type: "text",
                  },
                ],
                styles: {},
                type: "paragraph",
              },
            ],
            styles: {},
            type: "blockQuote",
          },
          {
            items: [
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content: "Bullet item 1",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: undefined,
                styles: {},
              },
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content: "Bullet item 2",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: undefined,
                styles: {},
              },
            ],
            styles: {},
            type: "list",
          },
          {
            items: [
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content: "Bullet item 3",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: undefined,
                styles: {},
              },
            ],
            styles: {},
            type: "list",
          },
          {
            items: [
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content:
                          "Bullet item 4 line 1\nBullet item 4 line 2\nBullet item 4 line ",
                        styles: {},
                        type: "text",
                      },
                      {
                        content: "3",
                        styles: {
                          bold: true,
                        },
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: undefined,
                styles: {},
              },
            ],
            styles: {},
            type: "list",
          },
          {
            items: [
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content: "Numbered item 1",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: 1,
                styles: {},
              },
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content: "Numbered item 2",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: 2,
                styles: {},
              },
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content: "Numbered item 3",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: 3,
                styles: {},
              },
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content: "Numbered item 6",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: 4,
                styles: {},
              },
              {
                checked: undefined,
                content: [
                  {
                    content: [
                      {
                        content: "Another list starting at 2",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: 5,
                styles: {},
              },
            ],
            styles: {},
            type: "list",
          },
          {
            items: [
              {
                checked: false,
                content: [
                  {
                    content: [
                      {
                        content: "Unchecked task 1",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: undefined,
                styles: {},
              },
              {
                checked: true,
                content: [
                  {
                    content: [
                      {
                        content: "Checked task 2",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: undefined,
                styles: {},
              },
              {
                checked: true,
                content: [
                  {
                    content: [
                      {
                        content: "Checked task 3",
                        styles: {},
                        type: "text",
                      },
                    ],
                    styles: {},
                    type: "paragraph",
                  },
                ],
                number: undefined,
                styles: {},
              },
            ],
            styles: {},
            type: "list",
          },
          {
            content: "Code block 1",
            language: undefined,
            type: "codeBlock",
          },
          {
            content: "Code block 2 (js)",
            language: "javascript",
            type: "codeBlock",
          },
          {
            columns: [
              {
                headerCell: {
                  content: [
                    {
                      content: "Heading 1",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
              },
              {
                headerCell: {
                  content: [
                    {
                      content: "Heading 2",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
              },
              {
                headerCell: {
                  content: [
                    {
                      content: "Heading ",
                      styles: {},
                      type: "text",
                    },
                    {
                      content: "3",
                      styles: {
                        bold: true,
                      },
                      type: "text",
                    },
                  ],
                  styles: {},
                },
              },
            ],
            rows: [
              [
                {
                  content: [
                    {
                      content: "Heading 1",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
                {
                  content: [
                    {
                      content: "Heading 2",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
                {
                  content: [
                    {
                      content: "Heading ",
                      styles: {},
                      type: "text",
                    },
                    {
                      content: "3",
                      styles: {
                        bold: true,
                      },
                      type: "text",
                    },
                  ],
                  styles: {},
                },
              ],
              [
                {
                  content: [
                    {
                      content: "Row 1 cell 1",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
                {
                  content: [
                    {
                      content: "Row 1 cell 2",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
                {
                  content: [
                    {
                      content: "Row 1 cell ",
                      styles: {},
                      type: "text",
                    },
                    {
                      content: "3",
                      styles: {
                        bold: true,
                      },
                      type: "text",
                    },
                  ],
                  styles: {},
                },
              ],
              [
                {
                  content: [
                    {
                      content: "Row 2 cell 1",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
                {
                  content: [
                    {
                      content: "Row 2 cell 2",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
                {
                  content: [
                    {
                      content: "Row 2 cell ",
                      styles: {},
                      type: "text",
                    },
                    {
                      content: "3",
                      styles: {
                        bold: true,
                      },
                      type: "text",
                    },
                  ],
                  styles: {},
                },
              ],
              [
                {
                  content: [
                    {
                      content: "Row 3 cell 1",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
                {
                  content: [
                    {
                      content: "Row 3 cell 2",
                      styles: {},
                      type: "text",
                    },
                  ],
                  styles: {},
                },
                {
                  content: [
                    {
                      content: "Row 3 cell ",
                      styles: {},
                      type: "text",
                    },
                    {
                      content: "3",
                      styles: {
                        bold: true,
                      },
                      type: "text",
                    },
                  ],
                  styles: {},
                },
              ],
            ],
            styles: {},
            type: "table",
          },
          {
            content: [
              {
                alt: "Image alt",
                caption: undefined,
                styles: {},
                target: {
                  type: "external",
                  url: "http://somewhere.somewhere",
                },
                type: "image",
              },
            ],
            styles: {},
            type: "paragraph",
          },
          {
            type: "break",
          },
          {
            type: "break",
          },
        ],
      },
    });
  });
});
