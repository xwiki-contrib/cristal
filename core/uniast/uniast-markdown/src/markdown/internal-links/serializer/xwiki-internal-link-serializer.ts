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
import { injectable } from "inversify";
import type { InternalLinksSerializer } from "./internal-links-serializer";
import type { UniAstToMarkdownConverter } from "../../uni-ast-to-markdown-converter";
import type { Link, LinkTarget } from "@xwiki/cristal-uniast-api";

/**
 * @since 0.22
 */
@injectable()
export class XWikiInternalLinkSerializer implements InternalLinksSerializer {
  async serialize(
    content: Link["content"],
    target: Extract<LinkTarget, { type: "internal" }>,
    uniAstToMarkdownConverter: UniAstToMarkdownConverter,
  ): Promise<string> {
    return `[[${await uniAstToMarkdownConverter.convertInlineContents(
      content,
    )}|${target.rawReference}]]`;
  }

  async serializeImage(
    target: Extract<LinkTarget, { type: "internal" }>,
    alt?: string,
  ): Promise<string> {
    return `![[${alt ?? ""}${alt ? "|" : ""}${target.rawReference}]]`;
  }
}
