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

import { Link, LinkType } from "@xwiki/cristal-link-suggest-api";
import { inject, injectable } from "inversify";
import type { DocumentService } from "@xwiki/cristal-document-api";
import type { CristalApp } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";
import type { LinkSuggestService } from "@xwiki/cristal-link-suggest-api";

/**
 * @since 0.11
 */
@injectable()
export class DocsLinkSuggestService implements LinkSuggestService {
  constructor(
    @inject("CristalApp") private readonly cristalApp: CristalApp,
    @inject("AuthenticationManagerProvider")
    private authenticationManagerProvider: AuthenticationManagerProvider,
    @inject("DocumentService")
    private documentService: DocumentService, 
  ) {}

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async getLinks(query: string,
    type?: LinkType,
    mimetype?: string): Promise<Link[]> {
    const authorization = await this.authenticationManagerProvider
      .get()
      ?.getAuthorizationHeader();
    const headers: { Accept: string; Authorization?: string } = {
      Accept: "application/json",
    };

    if (authorization) {
      headers.Authorization = authorization;
    }
  
    const config = this.cristalApp.getWikiConfig();
    const docId = this.documentService.getCurrentDocumentReference().value?.name;
    const url = `${config.baseURL}${docId}/attachments_list`;
    console.log("DocsLinkSuggest url: ", url); 
    const response = await fetch(url, {
      headers
    });
    const json = await response.json();
    console.log("DocsLinkSuggest json: ", json);
    var results = Object.values(json).map((result: any) => ({
      id: result.id,
      url: `#${result.id}`,
      reference: result.id,
      label: result.title || result.name || result.id,
      hint: result.name || result.title || "",
      type: LinkType.ATTACHMENT
    }));
    console.log("DocsLinkSuggest results: ", results);
    return results;
  }
}
