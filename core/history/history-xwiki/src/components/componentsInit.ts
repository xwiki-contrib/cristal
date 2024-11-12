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

import { getRestSpacesApiUrl } from "@xwiki/cristal-xwiki-utils";
import { inject, injectable } from "inversify";
import type { CristalApp, Logger, PageData } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";
import type {
  PageRevision,
  PageRevisionManager,
} from "@xwiki/cristal-history-api";

/**
 * Implementation of PageRevisionManager for the XWiki backend.
 *
 * @since 0.12
 **/
@injectable()
class XWikiPageRevisionManager implements PageRevisionManager {
  constructor(
    @inject<Logger>("Logger") private logger: Logger,
    @inject<CristalApp>("CristalApp") private cristalApp: CristalApp,
    @inject("PageRevisionManager")
    private defaultRevisionManager: PageRevisionManager,
    @inject<AuthenticationManagerProvider>("AuthenticationManagerProvider")
    private authenticationManagerProvider: AuthenticationManagerProvider,
  ) {
    this.logger.setModule("history.xwiki.XWikiPageRevisionManager");
  }

  async getRevisions(
    pageData: PageData,
    limit?: number,
    offset?: number,
  ): Promise<Array<PageRevision>> {
    const documentId = pageData.document.getIdentifier();
    if (documentId == null) {
      this.logger.debug(
        `No identifier found for page ${pageData.name}, falling back to default history manager.`,
      );
      return this.defaultRevisionManager.getRevisions(pageData);
    }
    const restApiSearchParams = new URLSearchParams();
    if (limit) {
      restApiSearchParams.append("number", limit.toString());
    }
    if (offset) {
      restApiSearchParams.append("start", offset.toString());
    }
    const restApiUrl =
      getRestSpacesApiUrl(this.cristalApp.getWikiConfig(), documentId) +
      "/history";

    try {
      const authorization = await this.authenticationManagerProvider
        .get()
        ?.getAuthorizationHeader();
      const headers: { Accept: string; Authorization?: string } = {
        Accept: "application/json",
      };

      if (authorization) {
        headers.Authorization = authorization;
      }
      const response = await fetch(restApiUrl, { headers });
      const jsonResponse = await response.json();
      const revisions: Array<PageRevision> =
        await Promise.all(
          jsonResponse.historySummaries.map(
            async (revision: {
              version: string;
              modified: string;
              modifier: string;
              comment: string;
            }) => {
              return {
                version: revision.version,
                date: new Date(revision.modified),
                user: {
                  profile: this.cristalApp.getRouter().resolve({
                    name: "view",
                    params: {
                      page: revision.modifier,
                    }
                  }).href,
                  name: await this.getUserName(revision.modifier),
                },
                comment: revision.comment,
                url: this.cristalApp.getRouter().resolve({
                  name: "view",
                  params: {
                    page: documentId,
                    revision: revision.version,
                  },
                }).href,
              }
            },
        )
      );
      return revisions;
    } catch (error) {
      this.logger.error(error);
      this.logger.debug(
        `Could not load history for page ${pageData.name}, falling back to default history manager.`,
      );
      return this.defaultRevisionManager.getRevisions(pageData);
    }
  }

  private async getUserName(userId: string): Promise<string> {
    const restApiUrl =
      getRestSpacesApiUrl(this.cristalApp.getWikiConfig(), userId) +
      "/objects/XWiki.XWikiUsers/0";

    try {
      const authorization = await this.authenticationManagerProvider
        .get()
        ?.getAuthorizationHeader();
      const headers: { Accept: string; Authorization?: string } = {
        Accept: "application/json",
      };

      if (authorization) {
        headers.Authorization = authorization;
      }
      const response = await fetch(restApiUrl, { headers });
      const jsonResponse = await response.json();
      let user = jsonResponse.pageName;
      jsonResponse.property.forEach(
        (property: { name: string; value: string }) => {
          // Properties are sorted alphabetically.
          switch (property.name) {
            case "first_name":
              user = property.value;
              break;
            case "last_name":
              if (property.value) {
                user += ` ${property.value}`;
              }
              break;
          }
        }
      );
      return user;
    } catch (error) {
      this.logger.error(error);
      this.logger.debug(
        `Could not load user details for page ${userId}.`,
      );
      return userId;
    }
  }
}

export { XWikiPageRevisionManager };
