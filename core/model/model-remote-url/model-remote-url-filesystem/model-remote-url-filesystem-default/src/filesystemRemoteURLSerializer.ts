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
import { RemoteURLSerializer } from "@xwiki/cristal-model-remote-url-api";
import { protocol } from "@xwiki/cristal-model-remote-url-filesystem-api";
import { injectable } from "inversify";

@injectable()
class FileSystemRemoteURLSerializer implements RemoteURLSerializer {
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
        const documentReference = reference as DocumentReference;
        const spaces = documentReference.space?.names
          .map(encodeURIComponent)
          .join("/");
        return `${protocol}://${spaces}/${encodeURIComponent(documentReference.name)}.md`;
      }
      case EntityType.ATTACHMENT: {
        const attachmentReference = reference as AttachmentReference;
        const documentReference = attachmentReference.document;
        const spaces = documentReference.space?.names
          .map(encodeURIComponent)
          .join("/");
        return `${protocol}://${spaces}/.${encodeURIComponent(documentReference.name)}/attachments/${encodeURIComponent(attachmentReference.name)}`;
      }
    }
  }
}

export { FileSystemRemoteURLSerializer };
