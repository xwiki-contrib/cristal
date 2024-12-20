/*
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
import { PageAttachment, PageData } from "@xwiki/cristal-api";
import {
  Link,
  LinkSuggestService,
  LinkType,
} from "@xwiki/cristal-link-suggest-api";
import { inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type { ModelReferenceParserProvider } from "@xwiki/cristal-model-reference-api";
import type { RemoteURLSerializerProvider } from "@xwiki/cristal-model-remote-url-api";

declare const fileSystemStorage: {
  search(
    query: string,
    type?: LinkType,
    mimetype?: string,
  ): Promise<(PageAttachment | PageData)[]>;
};

/**
 * Default implementation of the link suggestion service, for the file system backend.
 * The current implementation is based on full scan and does not scale
 * @since 0.13
 */
@injectable()
export class FilesystemLinkSuggestService implements LinkSuggestService {
  constructor(
    @inject<CristalApp>("CristalApp") private readonly cristalApp: CristalApp,
    @inject<RemoteURLSerializerProvider>("RemoteURLSerializerProvider")
    private readonly remoteURLSerializerProvider: RemoteURLSerializerProvider,
    @inject<ModelReferenceParserProvider>("ModelReferenceParserProvider")
    private readonly modelReferenceParserProvider: ModelReferenceParserProvider,
  ) {
    console.log(
      this.cristalApp,
      this.remoteURLSerializerProvider,
      this.modelReferenceParserProvider,
    );
  }

  async getLinks(
    query: string,
    type?: LinkType,
    mimetype?: string,
  ): Promise<Link[]> {
    const attachments = await fileSystemStorage.search(query, type, mimetype);
    console.log(attachments);
    // TODO: convert to links.
    return attachments.map((result) => {
      const attachment = result as PageAttachment;
      return {
        id: attachment.id,
        reference: attachment.reference,
        url: attachment.href,
        type: LinkType.ATTACHMENT,
        hint: "",
        label: attachment.id,
      };
    });
  }
}