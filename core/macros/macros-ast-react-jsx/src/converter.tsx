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
import { assertUnreachable, tryFallibleOrError } from "@xwiki/cristal-fn-utils";
import type {
  MacroBlock,
  MacroBlockStyles,
  MacroInlineContent,
  MacroLinkTarget,
} from "@xwiki/cristal-macros-api";
import type {
  RemoteURLParser,
  RemoteURLSerializer,
} from "@xwiki/cristal-model-remote-url-api";
import type {
  CSSProperties,
  HTMLAttributes,
  JSX,
  Ref,
  TdHTMLAttributes,
} from "react";

/**
 * @since 0.23
 * @beta
 */
export type MacroEditableZoneRef =
  | { type: "block"; ref: Ref<HTMLDivElement> }
  | { type: "inline"; ref: Ref<HTMLSpanElement> };

/**
 * Converter that transforms a macro's returned AST to React JSX
 *
 * @since 0.23
 * @beta
 */
export class MacrosAstToReactJsxConverter {
  constructor(
    private readonly remoteURLParser: RemoteURLParser,
    private readonly remoteURLSerializer: RemoteURLSerializer,
  ) {}

  blocksToReactJSX(
    blocks: MacroBlock[],
    editableZoneRef: MacroEditableZoneRef,
  ): JSX.Element[] | Error {
    return tryFallibleOrError(() =>
      blocks.map((block) => this.convertBlock(block, editableZoneRef)),
    );
  }

  inlineContentsToReactJSX(
    inlineContents: MacroInlineContent[],
    editableZoneRef: MacroEditableZoneRef,
  ): JSX.Element[] | Error {
    return tryFallibleOrError(() =>
      inlineContents.map((inlineContent) =>
        this.convertInlineContent(inlineContent, editableZoneRef),
      ),
    );
  }

  private convertBlock(
    block: MacroBlock,
    editableZoneRef: MacroEditableZoneRef,
  ): JSX.Element {
    switch (block.type) {
      case "paragraph":
        return (
          <p {...this.convertBlockStyles(block.styles)}>
            {block.content.map((inline) =>
              this.convertInlineContent(inline, editableZoneRef),
            )}
          </p>
        );

      case "heading":
        const TagName = `h${block.level}`;

        return (
          <TagName {...this.convertBlockStyles(block.styles)}>
            {block.content.map((inline) =>
              this.convertInlineContent(inline, editableZoneRef),
            )}
          </TagName>
        );

      case "list":
        const ListTag = block.numbered ? "ol" : "ul";

        return (
          <ListTag {...this.convertBlockStyles(block.styles)}>
            {block.items.map((item) => (
              <li>
                {item.checked !== undefined && (
                  <input type="checkbox" checked={item.checked} readOnly />
                )}
                {item.content.map((inline) =>
                  this.convertInlineContent(inline, editableZoneRef),
                )}
              </li>
            ))}
          </ListTag>
        );

      case "quote":
        return (
          <blockquote {...this.convertBlockStyles(block.styles)}>
            {block.content.map((subBlock) =>
              this.convertBlock(subBlock, editableZoneRef),
            )}
          </blockquote>
        );

      case "code":
        // TODO: syntax highlighting?
        return <code>{block.content}</code>;

      case "table":
        return (
          <table {...this.convertBlockStyles(block.styles)}>
            <colgroup>
              {block.columns.map((col) => {
                const attrs: HTMLAttributes<unknown> = {};

                if (col.widthPx) {
                  attrs.style = { width: `${col.widthPx}px` };
                }

                return <col {...attrs} />;
              })}
            </colgroup>

            {block.columns.find((col) => col.headerCell) && (
              <thead>
                <tr>
                  {block.columns.map((col) =>
                    col.headerCell ? (
                      <th {...this.convertBlockStyles(col.headerCell.styles)}>
                        {col.headerCell.content.map((inline) =>
                          this.convertInlineContent(inline, editableZoneRef),
                        )}
                      </th>
                    ) : (
                      <th></th>
                    ),
                  )}
                </tr>
              </thead>
            )}

            <tbody>
              {block.rows.map((row) => (
                <tr>
                  {row.map((cell) => {
                    const attrs: TdHTMLAttributes<HTMLTableCellElement> = {};

                    if (cell.colSpan) {
                      attrs.colSpan = cell.colSpan;
                    }

                    if (cell.rowSpan) {
                      attrs.rowSpan = cell.rowSpan;
                    }

                    return (
                      <td {...this.convertBlockStyles(cell.styles)}>
                        {cell.content.map((inline) =>
                          this.convertInlineContent(inline, editableZoneRef),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case "image":
        return (
          <img
            src={this.getTargetUrl(block.target)}
            alt={block.alt}
            width={block.widthPx}
            height={block.heightPx}
          />
        );

      case "rawHtml":
        return <div dangerouslySetInnerHTML={{ __html: block.html }} />;

      case "macroBlock":
        throw new Error("Nested macros are not supported yet");

      case "macroBlockEditableArea":
        if (editableZoneRef.type === "inline") {
          throw new Error(
            'Provided editable zone React ref is of type "inline", but macro requests type "block"',
          );
        }

        return <div ref={editableZoneRef.ref} />;

      default:
        assertUnreachable(block);
    }
  }

  private convertBlockStyles(
    styles: MacroBlockStyles,
  ): HTMLAttributes<unknown> {
    const out: HTMLAttributes<unknown> = {};

    if (styles.backgroundColor) {
      (out["style"] ??= {})["backgroundColor"] = styles.backgroundColor;
    }

    if (styles.textColor) {
      (out["style"] ??= {})["color"] = styles.textColor;
    }

    if (styles.textAlignment) {
      (out["style"] ??= {})["textAlign"] = styles.textAlignment;
    }

    if (styles.cssClasses) {
      out["className"] = styles.cssClasses.join(" ");
    }

    return out;
  }

  private convertInlineContent(
    inlineContent: MacroInlineContent,
    editableZoneRef: MacroEditableZoneRef,
  ): JSX.Element {
    switch (inlineContent.type) {
      case "text":
        const style: CSSProperties = {};

        if (inlineContent.styles.backgroundColor) {
          style.backgroundColor = inlineContent.styles.backgroundColor;
        }

        if (inlineContent.styles.textColor) {
          style.color = inlineContent.styles.textColor;
        }

        if (inlineContent.styles.bold) {
          style.fontWeight = "bold";
        }

        if (inlineContent.styles.italic) {
          style.fontStyle = "italic";
        }

        if (inlineContent.styles.underline) {
          style.textDecoration = "underline";
        }

        if (inlineContent.styles.strikethrough) {
          style.textDecoration = "line-through";
        }

        const attr = Object.values(style).length > 0 ? { style } : {};

        return <span {...attr}>{inlineContent.content}</span>;

      case "link":
        return (
          <a href={this.getTargetUrl(inlineContent.target)}>
            {inlineContent.content.map((content) =>
              this.convertInlineContent(content, editableZoneRef),
            )}
          </a>
        );

      case "rawHtml":
        return (
          <span dangerouslySetInnerHTML={{ __html: inlineContent.html }} />
        );

      case "inlineMacro":
        throw new Error("Nested macros are not supported yet");

      case "inlineMacroEditableArea":
        if (editableZoneRef.type === "block") {
          throw new Error(
            'Provided editable zone React ref is of type "block", but macro requests type "inline"',
          );
        }

        return <span ref={editableZoneRef.ref} />;

      default:
        assertUnreachable(inlineContent);
    }
  }

  private getTargetUrl(target: MacroLinkTarget): string {
    if (target.type === "external") {
      return target.url;
    }

    const { rawReference } = target;

    const parsedRef = tryFallibleOrError(() =>
      this.remoteURLParser.parse(rawReference),
    );

    if (parsedRef instanceof Error) {
      throw new Error(
        `Failed to parse reference "${rawReference}": ${parsedRef.message}`,
      );
    }

    const url = this.remoteURLSerializer.serialize(parsedRef);

    // TODO: when could this even happen?
    if (!url) {
      throw new Error(`Failed to serialize reference "${rawReference}"`);
    }

    return url;
  }
}

// TODO: add id to all mapped JSX children
