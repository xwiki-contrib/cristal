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
import { LinkType } from "@xwiki/cristal-link-suggest-api";
import { EntityType } from "@xwiki/cristal-model-api";
import { injectable } from "inversify";
import type { PageAttachment, PageData } from "@xwiki/cristal-api";
import type { Link, LinkSuggestService } from "@xwiki/cristal-link-suggest-api";

declare const fileSystemStorage: {
  search(
    query: string,
    type?: LinkType,
    mimetype?: string,
  ): Promise<
    (
      | { type: EntityType.ATTACHMENT; value: PageAttachment }
      | { type: EntityType.DOCUMENT; value: PageData }
    )[]
  >;
};

/**
 * Default implementation of the link suggestion service, for the file system backend.
 * The current implementation is based on full scan and does not scale
 * @since 0.13
 * @beta
 */
@injectable()
export class FilesystemLinkSuggestService implements LinkSuggestService {
  async getLinks(
    query: string,
    type?: LinkType,
    mimetype?: string,
  ): Promise<Link[]> {
    const attachments = await fileSystemStorage.search(query, type, mimetype);
    return attachments.map((result) => {
      switch (result.type) {
        case EntityType.ATTACHMENT: {
          const attachment = result.value;
          return {
            id: attachment.id,
            reference: attachment.reference,
            url: attachment.href,
            type: LinkType.ATTACHMENT,
            hint: "",
            label: attachment.id,
          };
        }
        case EntityType.DOCUMENT: {
          const document = result.value;
          return {
            id: document.id,
            reference: document.id,
            url: document.id,
            type: LinkType.PAGE,
            hint: "",
            label: document.id,
          };
        }
      }
    });
  }
}
