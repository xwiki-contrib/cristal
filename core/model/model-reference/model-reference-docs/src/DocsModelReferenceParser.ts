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
import { ModelReferenceParser } from "@xwiki/cristal-model-reference-api";
import { inject, injectable } from "inversify";
import type { DocumentService } from "@xwiki/cristal-document-api";

@injectable()
export class DocsModelReferenceParser implements ModelReferenceParser {
  constructor(
    @inject("DocumentService")
    private readonly documentService: DocumentService,
  ) {}

  parse(reference: string, type?: EntityType): EntityReference {
    if (/^https?:\/\//.test(reference)) {
      throw new Error(`[${reference}] is not a valid entity reference`);
    }
    return this.innerParse(reference, type);
  }

  private innerParse(reference: string, type: EntityType | undefined) {
    if (type == EntityType.ATTACHMENT || reference.includes("@")) {
      const strings = reference.split("@");
      if (strings.length == 1) {
        const doc = this.getCurrentDocumentReference();
        return new AttachmentReference(strings[0], doc);
      } else {
        const doc = this.parse(strings[0]);
        return new AttachmentReference(strings[1], doc as DocumentReference);
      }
    }
    return new DocumentReference(reference);
  }

  private getCurrentDocumentReference() {
    return this.documentService.getCurrentDocumentReference().value!;
  }
}
