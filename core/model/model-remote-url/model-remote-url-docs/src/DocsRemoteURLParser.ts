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
} from "@xwiki/cristal-model-api";
import { injectable } from "inversify";
import type { RemoteURLParser } from "@xwiki/cristal-model-remote-url-api";

@injectable()
export class DocsRemoteURLParser implements RemoteURLParser {
  // eslint-disable-next-line max-statements
  parse(urlStr: string): EntityReference | undefined {
    const baseURLstr = "http://localhost:8083/";
    if (!urlStr.startsWith(baseURLstr)) {
      throw new Error(
        `[${urlStr}] does not start with base url [${baseURLstr}]`,
      );
    }
    const baseURL = new URL(baseURLstr);
    const url = new URL(urlStr);
    const endPath = decodeURI(url.pathname.replace(baseURL.pathname, ""));

    const reverseSegments = endPath.split("/").reverse();

    if (urlStr.includes("/attachments/")) {
      const uuid = reverseSegments[0];
      const docUuid = reverseSegments[2];
      return new AttachmentReference(uuid, new DocumentReference(docUuid));
    } else {
      // TODO: update once Docs supports nested pages
      const uuid = reverseSegments[0];
      return new DocumentReference(uuid);
    }
  }
}
