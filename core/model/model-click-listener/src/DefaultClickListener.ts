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

import { ClickListener } from "./clickListener";
import { AttachmentReference, EntityType } from "@xwiki/cristal-model-api";
import { inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type { AttachmentPreview } from "@xwiki/cristal-attachments-api";
import type {
  RemoteURLParserProvider,
  RemoteURLSerializerProvider,
} from "@xwiki/cristal-model-remote-url-api";

@injectable()
class DefaultClickListener implements ClickListener {
  constructor(
    @inject("RemoteURLParserProvider")
    private readonly remoteURLParserProvider: RemoteURLParserProvider,
    @inject("RemoteURLSerializerProvider")
    private readonly remoteURLSerializerProvider: RemoteURLSerializerProvider,
    @inject("CristalApp") private readonly cristal: CristalApp,
    @inject("AttachmentPreview")
    private readonly attachmentPreview: AttachmentPreview,
  ) {}

  handle(element: HTMLElement): void {
    const remoteURLParser = this.remoteURLParserProvider.get();
    const remoteURLSerializer = this.remoteURLSerializerProvider.get()!;
    const cristal = this.cristal;
    const attachmentPreview = this.attachmentPreview;
    element.addEventListener(
      "click",
      function handleClick(event) {
        // If no parser is found, we let the click event go through.
        if (remoteURLParser) {
          const url = (event.target as HTMLLinkElement)?.href;
          try {
            const entityReference = remoteURLParser.parse(url);
            if (entityReference.type == EntityType.DOCUMENT) {
              event.preventDefault();
              cristal.setCurrentPage(
                remoteURLSerializer.serialize(entityReference) || "",
              );
            } else if (entityReference.type == EntityType.ATTACHMENT) {
              attachmentPreview.preview(entityReference as AttachmentReference);
            }
          } catch (e) {
            console.log(`Failed to parse [${url}] `, e);
          }
        }
      },
      true,
    );
  }
}

export { DefaultClickListener };
