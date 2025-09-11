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
import { DOMParser } from "happy-dom";
import { inject, injectable } from "inversify";
import type { UniAstToMarkdownConverter } from "../uni-ast-to-markdown-converter";
import type { ExternalLinksSerializer } from "./internal-links-serializer";
import type { RemoteURLSerializerProvider } from "@xwiki/cristal-model-remote-url-api";
import type { Link, LinkTarget } from "@xwiki/cristal-uniast-api";

// TODO: register in container, maybe asynchronously? and named Nextcloud
@injectable()
export class NextcloudInternalLinkSerializer
  implements ExternalLinksSerializer
{
  constructor(
    @inject("RemoteURLSerializerProvider")
    private readonly remoteURLSerializerProvider: RemoteURLSerializerProvider,
  ) {}

  async serialize(
    content: Link["content"],
    target: Extract<LinkTarget, { type: "internal" }>,
    uniAstToMarkdownConverter: UniAstToMarkdownConverter,
  ): Promise<string> {
    const label =
      await uniAstToMarkdownConverter.convertInlineContents(content);
    const urlFromReference = this.remoteURLSerializerProvider
      .get()!
      .serialize(target.parsedReference ?? undefined)!;
    const response = await fetch(urlFromReference, {
      method: "PROPFIND",
      body: `<?xml version="1.0" encoding="UTF-8"?>
 <d:propfind xmlns:d="DAV:">
   <d:prop xmlns:oc="http://owncloud.org/ns">
    <oc:fileid/>
   </d:prop>
 </d:propfind>`,
      headers: {
        Authorization: `Basic ${btoa("admin:admin")}`,
      },
    });
    // TODO: not portable, use fast-xml-parser instead.
    const xml = new DOMParser().parseFromString(
      await response.text(),
      "text/xml",
    );
    // TODO: error handling?
    const fileId = xml.getElementsByTagName("oc:fileid")[0].textContent;
    //TODO: replace with a nextcloud configuration
    const url = `http://localhost:9292/f/${fileId}`;
    return `[${label}](${url})`;
  }
}
