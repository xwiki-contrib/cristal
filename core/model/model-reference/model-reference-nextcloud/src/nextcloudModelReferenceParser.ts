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

import {
  AttachmentReference,
  DocumentReference,
  SpaceReference,
} from "@xwiki/cristal-model-api";
import { inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type { EntityReference } from "@xwiki/cristal-model-api";
import type { ModelReferenceParser } from "@xwiki/cristal-model-reference-api";

@injectable()
export class NextcloudModelReferenceParser implements ModelReferenceParser {
  constructor(
    @inject("CristalApp") private readonly cristalApp: CristalApp,
    @inject("AuthenticationManagerProvider")
    private readonly authenticationManagerProvider: AuthenticationManagerProvider,
  ) {}

  parse(reference: string): EntityReference {
    if (/^https?:\/\//.test(reference)) {
      throw new Error(`[${reference}] is not a valid entity reference`);
    }
    return this.legacyParsing(reference);
  }

  async parseAsync(reference: string): Promise<EntityReference> {
    if (/^https?:\/\//.test(reference)) {
      const baseURL = this.cristalApp.getWikiConfig().baseURL;
      if (reference.startsWith(baseURL)) {
        const fileid = reference.substring(`${baseURL}/f/`.length);
        if (parseInt(fileid, 10)) {
          await this.resolveByFileId(baseURL, reference);
        } else {
          throw new Error(`[${reference}] is not a valid entity reference`);
        }
      } else {
        throw new Error(`[${reference}] is not a valid entity reference`);
      }
    }
    return this.legacyParsing(reference);
  }

  private async resolveByFileId(baseURL: string, reference: string) {
    const ocsUrl = new URL(`${baseURL}/ocs/v2.php/references/resolve`);
    ocsUrl.searchParams.set("reference", reference);
    const request = await fetch(ocsUrl, {
      headers: {
        ...(await this.getCredentials()),
        Accept: "application/json",
        "OCS-APIRequest": "true",
      },
    });
    console.log(await request.json());
    throw new Error(`[${reference}] is not a valid entity reference`);
  }

  private legacyParsing(reference: string) {
    let segments = reference.split("/");
    if (segments[0] == "") {
      segments = segments.slice(1);
    }
    if (segments[segments.length - 2] == "attachments") {
      return new AttachmentReference(
        segments[segments.length - 1],
        new DocumentReference(
          segments[segments.length - 3],
          new SpaceReference(
            undefined,
            ...segments.slice(0, segments.length - 3),
          ),
        ),
      );
    } else {
      return new DocumentReference(
        segments[segments.length - 1],
        new SpaceReference(
          undefined,
          ...segments.slice(0, segments.length - 1),
        ),
      );
    }
  }
  private async getCredentials(): Promise<{ Authorization?: string }> {
    const authorizationHeader = await this.authenticationManagerProvider
      .get()
      ?.getAuthorizationHeader();
    const headers: { Authorization?: string } = {};
    if (authorizationHeader) {
      headers["Authorization"] = authorizationHeader;
    }
    return headers;
  }
}
