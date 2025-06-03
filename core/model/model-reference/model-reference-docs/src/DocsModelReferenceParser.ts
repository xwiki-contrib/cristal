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
  DocumentReference,
  EntityReference,
  EntityType,
} from "@xwiki/cristal-model-api";
import { ModelReferenceParser } from "@xwiki/cristal-model-reference-api";
import { injectable } from "inversify";

@injectable()
export class DocsModelReferenceParser implements ModelReferenceParser {
  parse(reference: string, type?: EntityType): EntityReference {
    if (/^https?:\/\//.test(reference)) {
      throw new Error(`[${reference}] is not a valid entity reference`);
    }
    return this.innerParse(reference, type);
  }

  private innerParse(reference: string, type: EntityType | undefined) {
    if (type == EntityType.ATTACHMENT) {
      throw new Error("not supported");
    }
    return new DocumentReference(reference);
  }
}
