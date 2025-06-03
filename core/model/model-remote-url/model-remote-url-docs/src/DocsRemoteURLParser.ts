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

import { DocumentReference, EntityReference } from "@xwiki/cristal-model-api";
import { inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type { RemoteURLParser } from "@xwiki/cristal-model-remote-url-api";

@injectable()
export class DocsRemoteURLParser implements RemoteURLParser {
  constructor(@inject("CristalApp") private readonly cristalApp: CristalApp) {}

  parse(urlStr: string): EntityReference | undefined {
    const baseURLstr = this.cristalApp.getWikiConfig().baseURL;
    if (!urlStr.startsWith(baseURLstr)) {
      throw new Error(
        `[${urlStr}] does not start with base url [${baseURLstr}]`,
      );
    }
    const baseURL = new URL(baseURLstr);
    const url = new URL(urlStr);
    const endPath = decodeURI(url.pathname.replace(baseURL.pathname, ""));

    const uuid = endPath.split("/").reverse()[0];

    // TODO: update once Docs supports nested pages
    return new DocumentReference(uuid);
  }
}
