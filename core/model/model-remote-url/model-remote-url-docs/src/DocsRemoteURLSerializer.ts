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
import {
  AttachmentReference,
  DocumentReference,
  EntityReference,
  EntityType,
} from "@xwiki/cristal-model-api";
import { inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type { RemoteURLSerializer } from "@xwiki/cristal-model-remote-url-api";

@injectable()
export class DocsRemoteURLSerializer implements RemoteURLSerializer {
  constructor(@inject("CristalApp") private readonly cristalApp: CristalApp) {}

  serialize(reference?: EntityReference): string | undefined {
    if (!reference) {
      return undefined;
    }

    switch (reference.type) {
      case EntityType.WIKI:
        throw new Error("Not implemented");
      case EntityType.SPACE:
        throw new Error("Not implemented");
      case EntityType.DOCUMENT: {
        return this.serializeDocument(reference);
      }
      case EntityType.ATTACHMENT: {
        return this.serializeAttachment(reference);
      }
    }
  }

  serializeAttachment(reference: AttachmentReference): string | undefined {
    return `http://localhost:8083/media/${reference.document.name}/${reference.name}`;
  }

  private serializeDocument(reference: DocumentReference) {
    const baseURL = this.cristalApp.getWikiConfig().baseURL;
    // http://localhost:8083/media/70028b46-51d5-4468-b0da-39502fcdad1b/attachments/53bf8816-64c4-402b-b332-16f9cf75ff4d.png
    return `${baseURL}/${reference.name}`;
  }
}
