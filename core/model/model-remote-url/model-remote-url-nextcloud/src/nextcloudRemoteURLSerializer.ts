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
  SpaceReference,
} from "@xwiki/cristal-model-api";
import { RemoteURLSerializer } from "@xwiki/cristal-model-remote-url-api";
import { inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";

@injectable()
class NextcloudRemoteURLSerializer implements RemoteURLSerializer {
  constructor(@inject("CristalApp") private readonly cristalApp: CristalApp) {}

  serialize(
    reference?: EntityReference,
    env?: { [key: string]: unknown },
  ): string | undefined {
    if (!reference) {
      return undefined;
    }
    switch (reference.type) {
      case EntityType.WIKI:
        throw new Error("Not implemented");
      case EntityType.SPACE:
        return this.serializeSpace(reference, env ?? {});
      case EntityType.DOCUMENT:
        return `${this.serializeDocument(reference, env ?? {})}.md`;
      case EntityType.ATTACHMENT:
        return this.serializeAttachment(reference, env ?? {});
    }
  }

  private serializeSpace(
    spaceReference: SpaceReference,
    env: { [key: string]: unknown },
  ) {
    const spaces = spaceReference.names.join("/");
    return `${this.getRootURL(spaceReference.wiki?.name ?? (env.username as string) ?? "")}/${spaces}`;
  }

  private serializeDocument(
    documentReference: DocumentReference,
    env: { [key: string]: unknown },
  ) {
    return `${this.serializeSpace(documentReference.space!, env)}/${documentReference.name}`;
  }

  private serializeMeta(
    documentReference: DocumentReference,
    env: { [key: string]: unknown },
  ) {
    return `${this.serializeSpace(documentReference.space!, env)}/.${documentReference.name}`;
  }

  private serializeAttachment(
    attachmentReference: AttachmentReference,
    env: { [key: string]: unknown },
  ) {
    return `${this.serializeMeta(attachmentReference.document, env)}/attachments/${attachmentReference.name}`;
  }

  private getRootURL(username: string) {
    const config = this.cristalApp.getWikiConfig();
    const url = (config.storageRoot ?? "/files/${username}/.cristal").replace(
      "${username}",
      username,
    );
    return `${config.baseRestURL}${url}`;
  }
}

export { NextcloudRemoteURLSerializer };
