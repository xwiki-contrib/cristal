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

import { Link, LinkType, name } from "@xwiki/cristal-link-suggest-api";
import { Container, inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type { LinkSuggestService } from "@xwiki/cristal-link-suggest-api";

/**
 * Default implementation of the link suggestion service, for XWiki.
 * Currently limited to guests, and to XWiki instances that have explicitly
 * allowed CORS, see https://cristal.xwiki.org/xwiki/bin/view/Backends/XWiki/
 * @since 0.8
 */
@injectable()
class XWikiLinkSuggestService implements LinkSuggestService {
  private cristalApp: CristalApp;

  constructor(@inject<CristalApp>("CristalApp") cristalApp: CristalApp) {
    this.cristalApp = cristalApp;
  }

  async getLinks(
    query: string,
    type?: LinkType,
    regex?: RegExp,
  ): Promise<Link[]> {
    // TODO: currently only proposing links available to guest
    const baseURL = this.cristalApp.getWikiConfig().baseURL;
    // await fetch("https://www.xwiki.org/xwiki/bin/get/XWiki/SuggestSolrService?query=fq%3Dtype%3AATTACHMENT%0Afq%3Dlocale%3A*%0Afq%3Dwiki%3Axwiki%0Afq%3Dspace%3A%22Documentation%22%0Afq%3Dname%3A%22WebHome%22%0Afq%3Dmimetype%3A((image%2F*))&nb=20&media=json&input=pdf", {
    //   "credentials": "include",
    //   "headers": {
    //     "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
    //     "Accept": "application/json, text/javascript, */*; q=0.01",
    //     "Accept-Language": "en-US,en;q=0.5",
    //     "XWiki-Form-Token": "DNaHExkv7Kn3Xfi6IzK5jw",
    //     "X-Requested-With": "XMLHttpRequest",
    //     "Sec-GPC": "1",
    //     "Sec-Fetch-Dest": "empty",
    //     "Sec-Fetch-Mode": "cors",
    //     "Sec-Fetch-Site": "same-origin",
    //     "Pragma": "no-cache",
    //     "Cache-Control": "no-cache"
    //   },
    //   "referrer": "https://www.xwiki.org/xwiki/bin/view/Documentation/",
    //   "method": "GET",
    //   "mode": "cors"
    // });
    const getParams = new URLSearchParams({
      sheet: "CKEditor.LinkSuggestions",
      // TODO: replace with XWiki.SuggestSolrService in order to be able to natively filter by type and by mimetype
      // See the image picker for examples
      outputSyntax: "plain",
      language: "en", // TODO: add support for multiple languages
      input: query,
    }).toString();
    const response = await fetch(`${baseURL}/bin/get/Main/?${getParams}`, {
      headers: {
        Accept: "application/json",
      },
    });

    const json = await response.json();

    return json
      .map(
        ({
          id,
          url,
          reference,
          label,
          hint,
          type,
        }: {
          id: string;
          url: string;
          reference: string;
          label: string;
          hint: string;
          type: string;
        }) => {
          const xwikiURL =
            this.cristalApp.getWikiConfig().baseURL +
            url.replace(/^\/xwiki/, "");
          const link: Link = {
            id,
            url: xwikiURL,
            reference,
            label,
            hint,
            type: type == "doc" ? LinkType.PAGE : LinkType.ATTACHMENT,
          };
          return link;
        },
      )
      .filter((link: Link) => {
        if (type == undefined) {
          return true;
        } else {
          const expectedType = link.type == type;
          if (!expectedType) return false;
          if (regex) {
            // TODO...
            return expectedType;
          } else {
            return true;
          }
        }
      });
  }
}

export class ComponentInit {
  constructor(container: Container) {
    container
      .bind<LinkSuggestService>(name)
      .to(XWikiLinkSuggestService)
      .inSingletonScope()
      .whenTargetNamed("XWiki");
  }
}
