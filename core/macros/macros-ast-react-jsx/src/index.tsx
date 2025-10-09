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

import { assertUnreachable } from "@xwiki/cristal-fn-utils";
import type {
  MacroAst,
  MacroBlock,
  MacroBlockStyles,
  MacroInlineContent,
} from "@xwiki/cristal-macros-api";
import type { HTMLAttributes, JSX } from "react";

/**
 * @since 0.22
 */
export class MacrosASTToReactJsxConverter {
  constructor(/* @inject("ModelReferenceParserProvider")
     private readonly modelReferenceParserProvider: ModelReferenceParserProvider,
     @inject("ModelReferenceHandlerProvider")
     private readonly modelReferenceHandlerProvider: ModelReferenceHandlerProvider,
     @inject("ParserConfigurationResolver")
     private readonly parserConfigurationResolver: ParserConfigurationResolver,*/) {}

  async toReactJSX(macroAst: MacroAst): Promise<JSX.Element[]> {
    const { blocks } = macroAst;

    return Promise.all(blocks.map((block) => this.convertBlock(block)));
  }

  private async convertBlock(block: MacroBlock): Promise<JSX.Element> {
    switch (block.type) {
      case "paragraph":
        return (
          <p {...this.convertBlockStyles(block.styles)}>
            {this.convertInlineContents(block.content)}
          </p>
        );

      case "heading":
        // TODO: styles
        // TODO: level h1, h2, ...h6
        return <>TODO</>;

      case "list":
        // TODO: styles
        return <>TODO</>;

      case "quote":
        return (
          <blockquote {...this.convertBlockStyles(block.styles)}>
            {await Promise.all(
              block.content.map((subBlock) => this.convertBlock(subBlock)),
            )}
          </blockquote>
        );

      case "code":
        // TODO: syntax highlighting?
        return <code>{block.content}</code>;

      case "table":
        // TODO: styles
        return <>TDOO</>;

      case "image":
        return (
          <img
            src={"TODO"}
            alt={block.alt}
            width={block.widthPx}
            height={block.heightPx}
          />
        );

      case "macroBlock":
        throw new Error("Nested macros are not supported yet");

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

  private async convertInlineContent(
    inlineContent: MacroInlineContent,
  ): Promise<JSX.Element> {
    switch (inlineContent.type) {
      case "text":
        throw new Error("TODO");

      case "link":
        throw new Error("TODO");

      case "inlineMacro":
        throw new Error("TODO");

      default:
        assertUnreachable(inlineContent);
    }
  }
}
