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
import { macrosAstToHtmlConverterName } from "@xwiki/cristal-macros-ast-html-converter";
import {
  assertUnreachable,
  escapeHtml,
  produceHtmlEl,
  tryFallibleOrError,
} from "@xwiki/platform-fn-utils";
import { macrosServiceName } from "@xwiki/platform-macros-service";
import { inject, injectable } from "inversify";
import type { UniAstToHTMLConverter } from "./uni-ast-to-html-converter";
import type { MacrosAstToHtmlConverter } from "@xwiki/cristal-macros-ast-html-converter";
import type { MacrosService } from "@xwiki/platform-macros-service";
import type { EntityReference } from "@xwiki/platform-model-api";
import type { ModelReferenceParserProvider } from "@xwiki/platform-model-reference-api";
import type { RemoteURLSerializerProvider } from "@xwiki/platform-model-remote-url-api";
import type {
  Block,
  BlockStyles,
  Image,
  InlineContent,
  LinkTarget,
  UniAst,
} from "@xwiki/platform-uniast-api";

@injectable()
export class DefaultUniAstToHTMLConverter implements UniAstToHTMLConverter {
  constructor(
    @inject("RemoteURLSerializerProvider")
    private readonly remoteURLSerializerProvider: RemoteURLSerializerProvider,

    @inject("ModelReferenceParserProvider")
    private readonly modelReferenceParserProvider: ModelReferenceParserProvider,

    @inject(macrosServiceName)
    private readonly macrosService: MacrosService,

    @inject(macrosAstToHtmlConverterName)
    private readonly macrosAstToHtmlConverter: MacrosAstToHtmlConverter,
  ) {}

  toHtml(ast: UniAst): string | Error {
    return tryFallibleOrError(() => this.convertBlocks(ast.blocks));
  }

  private convertBlocks(blocks: Block[]): string {
    return blocks.map((block) => this.convertBlock(block)).join("");
  }

  private convertInlineContents(inlineContents: InlineContent[]): string {
    return inlineContents
      .map((inlineContent) => this.convertInlineContent(inlineContent))
      .join("");
  }

  // eslint-disable-next-line max-statements
  private convertBlock(block: Block): string {
    switch (block.type) {
      case "paragraph":
        return this.produceBlockHtml(
          "p",
          block.styles,
          this.convertInlineContents(block.content),
        );

      case "heading":
        return this.produceBlockHtml(
          `h${block.level}`,
          block.styles,
          this.convertInlineContents(block.content),
        );

      case "list":
        return this.produceBlockHtml(
          block.items.length > 0 && block.items[0].number !== undefined
            ? "ol"
            : "ul",
          block.styles,
          block.items
            .map((item) =>
              produceHtmlEl(
                "li",
                {},
                `${item.checked !== undefined ? produceHtmlEl("input", { type: "checkbox", checked: item.checked.toString(), readonly: "true" }, false) : ""}${this.convertBlocks(item.content)}`,
              ),
            )
            .join(""),
        );

      case "quote":
        return this.produceBlockHtml(
          "blockquote",
          block.styles,
          this.convertBlocks(block.content),
        );

      case "code":
        // TODO: syntax highlighting?
        return this.produceBlockHtml("pre", {}, escapeHtml(block.content));

      case "table": {
        const colgroup = produceHtmlEl(
          "colgroup",
          {},
          block.columns
            .map((col) =>
              produceHtmlEl(
                "col",
                {
                  width: col.widthPx ? `${col.widthPx}px` : undefined,
                },
                false,
              ),
            )
            .join(""),
        );

        const thead = block.columns.find((col) => col.headerCell)
          ? produceHtmlEl(
              "thead",
              {},
              produceHtmlEl(
                "tr",
                {},
                block.columns
                  .map((col) =>
                    col.headerCell
                      ? this.produceBlockHtml(
                          "th",
                          col.headerCell.styles,
                          this.convertInlineContents(col.headerCell.content),
                        )
                      : "",
                  )
                  .join(""),
              ),
            )
          : "";

        const tbody = block.rows
          .map((row) =>
            produceHtmlEl(
              "tr",
              {},
              row
                .map((cell) =>
                  this.produceBlockHtml(
                    "td",
                    cell.styles,
                    this.convertInlineContents(cell.content),
                    {
                      colspan: cell.colSpan?.toString(),
                      rowspan: cell.rowSpan?.toString(),
                    },
                  ),
                )
                .join(""),
            ),
          )
          .join("");

        return this.produceBlockHtml(
          "table",
          block.styles,
          [colgroup, thead, tbody].join(""),
        );
      }

      case "image":
        return this.convertImage(block);

      case "break":
        return "<hr>";

      case "macroBlock": {
        const macro = this.macrosService.get(block.call.id);

        if (!macro) {
          // TODO: proper error reporting
          // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-725
          return `<strong>Macro "${block.call.id}" was not found</strong>`;
        }

        if (macro.renderAs === "inline") {
          // TODO: proper error reporting
          // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-725
          return `<strong>Macro "${block.call.id}" is of type "inline", but used here as a block</strong>`;
        }

        /** The macro's input body (if raw) */
        let rawBody: string | null;

        /** The macro's input body (if WYSIWYG) */
        let htmlBody: string | null;

        switch (macro.infos.bodyType) {
          case "none":
            rawBody = null;
            htmlBody = null;
            break;

          case "raw":
            if (block.call.body.type !== "raw") {
              throw new Error(
                "Expected raw body for macro with raw body, found: " +
                  block.call.body.type,
              );
            }

            rawBody = block.call.body.content;
            htmlBody = null;
            break;

          case "wysiwyg":
            if (block.call.body.type !== "inlineContents") {
              throw new Error(
                "Expected inline contents body for macro, found: " +
                  block.call.body.type,
              );
            }

            rawBody = null;
            htmlBody = this.convertInlineContents(
              block.call.body.inlineContents,
            );
            break;
        }

        const rendered = this.macrosAstToHtmlConverter.blocksToHTML(
          macro.render(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            block.call.params as any,
            rawBody,
          ),
          htmlBody,
        );

        if (rendered instanceof Error) {
          throw rendered;
        }

        return rendered;
      }

      default:
        assertUnreachable(block);
    }
  }

  private convertImage(image: Image): string {
    return produceHtmlEl(
      "img",
      {
        src: this.getTargetUrl(image.target),
        alt: image.alt || undefined,
        width: image.widthPx ? `${image.widthPx}px` : undefined,
        height: image.heightPx ? `${image.heightPx}px` : undefined,
      },
      false,
    );
  }

  // eslint-disable-next-line max-statements
  private convertInlineContent(inlineContent: InlineContent): string {
    switch (inlineContent.type) {
      case "text": {
        const { content, styles } = inlineContent;

        const {
          bold,
          italic,
          strikethrough,
          underline,
          code,
          textColor,
          backgroundColor,
        } = styles;

        let html = escapeHtml(content);

        if (bold) {
          html = produceHtmlEl("strong", { style: "font-weight: bold;" }, html);
        }

        if (italic) {
          html = produceHtmlEl("em", { style: "font-style: italic;" }, html);
        }

        if (strikethrough) {
          html = produceHtmlEl(
            "s",
            { style: "text-decoration: italic;" },
            html,
          );
        }

        if (underline) {
          html = produceHtmlEl(
            "u",
            { style: "text-decoration: underline;" },
            html,
          );
        }

        if (textColor) {
          html = produceHtmlEl("span", { style: `color: ${textColor};` }, html);
        }

        if (backgroundColor) {
          html = produceHtmlEl(
            "span",
            { style: `background-color: ${backgroundColor};` },
            html,
          );
        }

        // Code must be last as it's going to be the most outer surrounding
        // Otherwise other surroundings would be "trapped" inside the inline code content
        if (code) {
          html = produceHtmlEl("pre", {}, html);
        }

        return html;
      }

      case "link":
        return produceHtmlEl(
          "a",
          {
            href: this.getTargetUrl(inlineContent.target),
            ...(inlineContent.target.type === "external"
              ? { class: "wikiexternallink" }
              : {}),
          },
          this.convertInlineContents(inlineContent.content),
        );

      case "image":
        return this.convertImage(inlineContent);

      case "inlineMacro": {
        const macro = this.macrosService.get(inlineContent.call.id);

        if (!macro) {
          // TODO: proper error reporting
          // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-725
          return `<strong>Macro "${inlineContent.call.id}" was not found</strong>`;
        }

        if (macro.renderAs === "block") {
          // TODO: proper error reporting
          // Tracking issue: https://jira.xwiki.org/browse/CRISTAL-725
          return `<strong>Macro "${inlineContent.call.id}" is of type "block", but used here as inline</strong>`;
        }

        /** The macro's input body (if raw) */
        let rawBody: string | null;

        /** The macro's input body (if WYSIWYG) */
        let htmlBody: string | null;

        switch (macro.infos.bodyType) {
          case "none":
            rawBody = null;
            htmlBody = null;
            break;

          case "raw":
            if (inlineContent.call.body.type !== "raw") {
              throw new Error(
                "Expected raw body for macro with raw body, found: " +
                  inlineContent.call.body.type,
              );
            }

            rawBody = inlineContent.call.body.content;
            htmlBody = null;
            break;

          case "wysiwyg":
            if (inlineContent.call.body.type !== "inlineContent") {
              throw new Error(
                "Expected inline content body for macro, found: " +
                  inlineContent.call.body.type,
              );
            }

            rawBody = null;
            htmlBody = this.convertInlineContent(
              inlineContent.call.body.inlineContent,
            );
        }

        const rendered = this.macrosAstToHtmlConverter.inlineContentsToHTML(
          macro.render(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            inlineContent.call.params as any,
            rawBody,
          ),
          htmlBody,
        );

        if (rendered instanceof Error) {
          throw rendered;
        }

        return rendered;
      }

      default:
        assertUnreachable(inlineContent);
    }
  }

  private getTargetUrl(target: LinkTarget): string {
    if (target.type === "external") {
      return target.url;
    }

    if (target.parsedReference) {
      return this.serializeReference(target.parsedReference)!;
    }

    const ref = this.modelReferenceParserProvider
      .get()!
      .parse(target.rawReference);

    return this.serializeReference(ref)!;
  }

  private serializeReference(ref: EntityReference): string {
    const url = this.remoteURLSerializerProvider.get()!.serialize(ref);

    // TODO: find when this could happen
    if (!url) {
      throw new Error(`Failed to serialize entity reference: "${url}"`);
    }

    return url;
  }

  private produceBlockHtml(
    tagName: string,
    styles: BlockStyles,
    innerHTML: string,
    attrs?: Record<string, string | undefined>,
  ): string {
    let cssRules = "";

    if (styles.backgroundColor) {
      cssRules += `background-color: ${styles.backgroundColor};`;
    }

    if (styles.textColor) {
      cssRules += `color: ${styles.textColor};`;
    }

    if (styles.textAlignment) {
      cssRules += `text-align: ${styles.textAlignment};`;
    }

    return produceHtmlEl(
      tagName,
      {
        ...attrs,
        style: cssRules !== "" ? cssRules.trim() : undefined,
      },
      innerHTML,
    );
  }
}
