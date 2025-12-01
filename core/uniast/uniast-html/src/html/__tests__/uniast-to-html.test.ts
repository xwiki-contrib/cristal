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

import { DefaultUniAstToHTMLConverter } from "../default-uni-ast-to-html-converter";
import { macrosAstToHtmlConverterName } from "@xwiki/cristal-macros-ast-html-converter";
import { macrosServiceName } from "@xwiki/cristal-macros-service";
import {
  AttachmentReference,
  DocumentReference,
  SpaceReference,
} from "@xwiki/platform-model-api";
import { Container } from "inversify";
import { describe, expect, test } from "vitest";
import { any, mock } from "vitest-mock-extended";
import type { MacrosAstToHtmlConverter } from "@xwiki/cristal-macros-ast-html-converter";
import type { MacrosService } from "@xwiki/cristal-macros-service";
import type {
  RemoteURLParserProvider,
  RemoteURLSerializer,
  RemoteURLSerializerProvider,
} from "@xwiki/cristal-model-remote-url-api";
import type { BlockStyles } from "@xwiki/cristal-uniast-api";
import type {
  ModelReferenceHandlerProvider,
  ModelReferenceParser,
  ModelReferenceParserProvider,
  ModelReferenceSerializerProvider,
} from "@xwiki/platform-model-reference-api";

// eslint-disable-next-line max-statements
function init() {
  const modelReferenceParserProvider = mock<ModelReferenceParserProvider>();
  const remoteURLSerializerProvider = mock<RemoteURLSerializerProvider>();
  const modelReferenceParser = mock<ModelReferenceParser>();
  const remoteURLSerializer = mock<RemoteURLSerializer>();
  const macrosService = mock<MacrosService>();
  const macrosAstToHtmlConverter = mock<MacrosAstToHtmlConverter>();

  const containerMock = mock<Container>();

  containerMock.get
    .calledWith("ModelReferenceParserProvider")
    .mockReturnValue(modelReferenceParserProvider);

  containerMock.get
    .calledWith("ModelReferenceSerializerProvider")
    .mockReturnValue(mock<ModelReferenceSerializerProvider>());

  containerMock.get
    .calledWith("RemoteURLParserProvider")
    .mockReturnValue(mock<RemoteURLParserProvider>());

  containerMock.get
    .calledWith("RemoteURLSerializerProvider")
    .mockReturnValue(remoteURLSerializerProvider);

  containerMock.get
    .calledWith("ModelReferenceHandlerProvider")
    .mockReturnValue(mock<ModelReferenceHandlerProvider>());

  containerMock.get
    .calledWith(macrosServiceName)
    .mockReturnValue(macrosService);

  containerMock.get
    .calledWith(macrosAstToHtmlConverterName)
    .mockReturnValue(macrosAstToHtmlConverter);

  modelReferenceParserProvider.get.mockReturnValue(modelReferenceParser);
  remoteURLSerializerProvider.get.mockReturnValue(remoteURLSerializer);

  const attachmentReference = new AttachmentReference(
    "image.png",
    new DocumentReference("B", new SpaceReference(undefined, "A")),
  );
  modelReferenceParser.parse
    .calledWith("A.B@image.png", any())
    .mockReturnValue(attachmentReference);

  remoteURLSerializer.serialize
    .calledWith(attachmentReference)
    .mockReturnValue("https://my.site/A/B/image.png");

  return {
    remoteURLSerializerProvider,
    modelReferenceParserProvider,
    macrosService,
    macrosAstToHtmlConverter,
  };
}

// eslint-disable-next-line max-statements
describe("UniAstToHTMLConverter", () => {
  const {
    remoteURLSerializerProvider,
    modelReferenceParserProvider,
    macrosService,
    macrosAstToHtmlConverter,
  } = init();

  const uniAstToHTMLConverter = new DefaultUniAstToHTMLConverter(
    remoteURLSerializerProvider,
    modelReferenceParserProvider,
    macrosService,
    macrosAstToHtmlConverter,
  );

  test("empty ast", () => {
    const res = uniAstToHTMLConverter.toHtml({ blocks: [] });
    expect(res).toBe("");
  });

  test("simple text", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "paragraph",
          styles: {},
          content: [
            {
              type: "text",
              styles: {},
              content: "test",
            },
          ],
        },
      ],
    });
    expect(res).toBe("<p>test</p>");
  });

  test("bold text", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "paragraph",
          styles: {},
          content: [
            {
              type: "text",
              styles: {
                bold: true,
              },
              content: "test",
            },
          ],
        },
      ],
    });
    expect(res).toBe('<p><strong style="font-weight: bold;">test</strong></p>');
  });

  test("strikethrough and italic text", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "paragraph",
          styles: {},
          content: [
            {
              type: "text",
              styles: {
                strikethrough: true,
                italic: true,
              },
              content: "test",
            },
          ],
        },
      ],
    });
    expect(res).toBe(
      '<p><s style="text-decoration: italic;"><em style="font-style: italic;">test</em></s></p>',
    );
  });

  test("text with special char", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "paragraph",
          styles: {},
          content: [
            {
              type: "text",
              styles: {},
              content: "<bold>escape me </bold>",
            },
          ],
        },
      ],
    });
    expect(res).toBe("<p>&lt;bold&gt;escape me &lt;/bold&gt;</p>");
  });

  test("text with special char", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "paragraph",
          styles: {},
          content: [
            {
              type: "text",
              styles: {},
              content: "<bold>escape me </bold>",
            },
          ],
        },
      ],
    });
    expect(res).toBe("<p>&lt;bold&gt;escape me &lt;/bold&gt;</p>");
  });

  test.each([1, 2, 3, 4, 5, 6])("Heading level $level", (level) => {
    expect(
      uniAstToHTMLConverter.toHtml({
        // @ts-expect-error level is an union but we know the provided values are fine.
        blocks: [{ type: "heading", level, content: [], styles: {} }],
      }),
    ).toBe(`<h${level}></h${level}>`);
  });

  test("list", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "list",
          styles: {},
          items: [
            {
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      content: "item A",
                      styles: {},
                    },
                    {
                      type: "text",
                      content: "item A bis",
                      styles: {},
                    },
                  ],
                  styles: {},
                },
              ],
              styles: {},
            },
            {
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      content: "item B",
                      styles: {},
                    },
                  ],
                  styles: {},
                },
              ],
              styles: {},
            },
          ],
        },
      ],
    });
    expect(res).toBe(
      "<ul><li><p>item Aitem A bis</p></li><li><p>item B</p></li></ul>",
    );
  });

  test("quote", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "quote",
          styles: {},
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  content: "item A",
                  styles: {},
                },
              ],
              styles: {},
            },
          ],
        },
      ],
    });
    expect(res).toBe("<blockquote><p>item A</p></blockquote>");
  });

  test("code", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "code",
          language: "typescript",
          content: "console.log('hello world')",
        },
      ],
    });
    expect(res).toBe("<pre>console.log('hello world')</pre>");
  });
  test("table", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "table",
          columns: [
            {
              headerCell: {
                content: [
                  {
                    type: "text",
                    content: "header 1",
                    styles: {},
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
                    type: "text",
                    content: "cell 1",
                    styles: {},
                  },
                ],
                styles: {},
              },
            ],
          ],
          styles: {},
        },
      ],
    });
    expect(res).toBe(
      "<table><colgroup><col></colgroup><thead><tr><th>header 1</th></tr></thead><tbody><tr><td>cell 1</td></tr></tbody></table>",
    );
  });

  test("external image", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "image",
          target: { type: "external", url: "https://my.site/image.png" },
          styles: {},
        },
      ],
    });
    expect(res).toBe('<img src="https://my.site/image.png">');
  });

  test("external image with alt", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "image",
          target: { type: "external", url: "https://my.site/image.png" },
          // caption?
          alt: "image alt",
          //     widthPx?
          //       heightPx?
          styles: {},
        },
      ],
    });
    expect(res).toBe('<img src="https://my.site/image.png" alt="image alt">');
  });

  test("internal image", () => {
    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        {
          type: "image",
          target: {
            type: "internal",
            rawReference: "A.B@image.png",
            parsedReference: null,
          },
          // caption?
          alt: "image alt",
          //     widthPx?
          //       heightPx?
          styles: {},
        },
      ],
    });
    expect(res).toBe(
      '<img src="https://my.site/A/B/image.png" alt="image alt">',
    );
  });

  test("styling", () => {
    const styles: BlockStyles = {
      backgroundColor: "#000000",
      textColor: "#FFFFFF",
      textAlignment: "right",
    };

    const res = uniAstToHTMLConverter.toHtml({
      blocks: [
        { type: "paragraph", content: [], styles },
        { type: "heading", level: 1, content: [], styles },
        { type: "heading", level: 2, content: [], styles },
        { type: "heading", level: 3, content: [], styles },
        { type: "heading", level: 4, content: [], styles },
        { type: "heading", level: 5, content: [], styles },
        { type: "heading", level: 6, content: [], styles },
        {
          type: "list",
          items: [
            { content: [], styles },
            { checked: false, content: [], styles },
            { checked: true, content: [], styles },
            { number: 1, content: [], styles },
          ],
          styles,
        },
        {
          type: "quote",
          content: [{ type: "paragraph", content: [], styles }],
          styles,
        },
        { type: "code", content: "Some code here" },
        { type: "code", content: "Some code here", language: "some-language" },
        {
          type: "table",
          columns: [
            {},
            { headerCell: { content: [], styles } },
            { widthPx: 200 },
          ],
          rows: [
            [
              { content: [], styles },
              { content: [], styles },
              { content: [], styles, rowSpan: 1 },
            ],
            [{ content: [], styles, colSpan: 2, rowSpan: 3 }],
          ],
          styles,
        },
        {
          type: "image",
          target: {
            type: "internal",
            rawReference: "A.B@image.png",
            parsedReference: null,
          },
          styles: {
            alignment: "right",
          },
        },
        {
          type: "image",
          target: {
            type: "internal",
            rawReference: "A.B@image.png",
            parsedReference: null,
          },
          alt: "Some alt caption",
          widthPx: 100,
          heightPx: 200,
          styles: { alignment: "right" },
        },
        {
          type: "image",
          target: { type: "external", url: "https://picsum.photos/536/354" },
          styles: { alignment: "right" },
        },
      ],
    });

    expect(res).toBe(
      [
        '<p style="background-color: #000000;color: #FFFFFF;text-align: right;"></p>',
        '<h1 style="background-color: #000000;color: #FFFFFF;text-align: right;"></h1>',
        '<h2 style="background-color: #000000;color: #FFFFFF;text-align: right;"></h2>',
        '<h3 style="background-color: #000000;color: #FFFFFF;text-align: right;"></h3>',
        '<h4 style="background-color: #000000;color: #FFFFFF;text-align: right;"></h4>',
        '<h5 style="background-color: #000000;color: #FFFFFF;text-align: right;"></h5>',
        '<h6 style="background-color: #000000;color: #FFFFFF;text-align: right;"></h6>',
        '<ul style="background-color: #000000;color: #FFFFFF;text-align: right;">',
        "<li></li>",
        '<li><input type="checkbox" checked="false" readonly="true"></li>',
        '<li><input type="checkbox" checked="true" readonly="true"></li>',
        "<li></li>",
        "</ul>",
        '<blockquote style="background-color: #000000;color: #FFFFFF;text-align: right;"><p style="background-color: #000000;color: #FFFFFF;text-align: right;"></p></blockquote>',
        "<pre>Some code here</pre>",
        "<pre>Some code here</pre>",
        '<table style="background-color: #000000;color: #FFFFFF;text-align: right;">',
        '<colgroup><col><col><col width="200px"></colgroup>',
        '<thead><tr><th style="background-color: #000000;color: #FFFFFF;text-align: right;"></th></tr></thead>',
        "<tbody>",
        '<tr><td style="background-color: #000000;color: #FFFFFF;text-align: right;"></td><td style="background-color: #000000;color: #FFFFFF;text-align: right;"></td><td rowspan="1" style="background-color: #000000;color: #FFFFFF;text-align: right;"></td></tr>',
        '<tr><td colspan="2" rowspan="3" style="background-color: #000000;color: #FFFFFF;text-align: right;"></td></tr>',
        "</tbody>",
        "</table>",
        '<img src="https://my.site/A/B/image.png">',
        '<img src="https://my.site/A/B/image.png" alt="Some alt caption" width="100px" height="200px">',
        '<img src="https://picsum.photos/536/354">',
      ].join(""),
    );
  });
});
