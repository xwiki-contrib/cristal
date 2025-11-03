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
import { DefaultMacrosAstToHtmlConverter } from "../default-macros-ast-to-html-converter";
import { describe, expect, test } from "vitest";
import { mock } from "vitest-mock-extended";
import type { MacroInlineContent } from "@xwiki/cristal-macros-api";
import type {
  ModelReferenceParser,
  ModelReferenceParserProvider,
} from "@xwiki/cristal-model-reference-api";
import type {
  RemoteURLSerializer,
  RemoteURLSerializerProvider,
} from "@xwiki/cristal-model-remote-url-api";
import type { Container } from "inversify";

function init() {
  const modelReferenceParserProvider = mock<ModelReferenceParserProvider>();
  const remoteURLSerializerProvider = mock<RemoteURLSerializerProvider>();

  const containerMock = mock<Container>();

  containerMock.get
    .calledWith("ModelReferenceParserProvider")
    .mockReturnValue(modelReferenceParserProvider);

  containerMock.get
    .calledWith("RemoteURLSerializerProvider")
    .mockReturnValue(remoteURLSerializerProvider);

  modelReferenceParserProvider.get.mockReturnValue(
    mock<ModelReferenceParser>(),
  );
  remoteURLSerializerProvider.get.mockReturnValue(mock<RemoteURLSerializer>());

  return { modelReferenceParserProvider, remoteURLSerializerProvider };
}

describe("MacrosAstToHtmlConverter", () => {
  const { modelReferenceParserProvider, remoteURLSerializerProvider } = init();

  const converter = new DefaultMacrosAstToHtmlConverter(
    modelReferenceParserProvider,
    remoteURLSerializerProvider,
  );

  function expectInlineContentToBe(
    inlineContents: MacroInlineContent[],
    expectedHtml: string,
  ) {
    expect(converter.inlineContentsToHTML(inlineContents)).toBe(expectedHtml);

    expect(
      converter.blocksToHTML([
        { type: "paragraph", styles: {}, content: inlineContents },
      ]),
    ).toBe(`<p>${expectedHtml}</p>`);
  }

  test("empty AST", () => {
    expectInlineContentToBe([], "");
  });

  test("simple text", () => {
    expectInlineContentToBe(
      [{ type: "text", content: "Hello world!", styles: {} }],
      "Hello world!",
    );
  });

  test("styled text", () => {
    expectInlineContentToBe(
      [
        {
          type: "text",
          content: "Hello world!",
          styles: {
            bold: true,
            italic: true,
            backgroundColor: "#000000",
            textColor: "#FFFFFF",
            code: true,
            strikethrough: true,
            underline: true,
          },
        },
      ],
      '<pre><span style="background-color: #000000;"><span style="color: #FFFFFF;"><u style="text-decoration: underline;"><s style="text-decoration: italic;"><em style="font-style: italic;"><strong style="font-weight: bold;">Hello world!</strong></em></s></u></span></span></pre>',
    );
  });

  test("text chaining", () => {
    expectInlineContentToBe(
      [
        { type: "text", content: "Hello", styles: { bold: true } },
        { type: "text", content: "World", styles: {} },
        { type: "text", content: "!", styles: { underline: true } },
      ],
      '<strong style="font-weight: bold;">Hello</strong>World<u style="text-decoration: underline;">!</u>',
    );
  });
});
