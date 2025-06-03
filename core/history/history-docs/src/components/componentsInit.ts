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

import { inject, injectable } from "inversify";
import type { AlertsService } from "@xwiki/cristal-alerts-api";
import type { CristalApp, Logger, PageData } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";
import type {
  PageRevision,
  PageRevisionManager,
} from "@xwiki/cristal-history-api";

/**
 * Implementation of PageRevisionManager for the Docs backend.
 *
 * @since 0.12
 **/
@injectable()
class DocsPageRevisionManager implements PageRevisionManager {
  constructor(
    @inject("CristalApp") private readonly cristalApp: CristalApp,
    @inject("Logger") private readonly logger: Logger,
    @inject("AlertsService")
    private readonly alertsService: AlertsService,
    @inject("AuthenticationManagerProvider")
    private readonly authenticationManagerProvider: AuthenticationManagerProvider,
  ) {
    this.logger.setModule("history-docs.DocsPageRevisionManager");
  }

  async getRevisions(pageData: PageData): Promise<Array<PageRevision>> {
    const revisions: Array<PageRevision> = [];
    if (pageData) {
      const currentId = pageData.id;

      const authorization = await this.authenticationManagerProvider
        .get()
        ?.getAuthorizationHeader();
      const headers: { Accept: string; Authorization?: string } = {
        Accept: "application/json",
      };
      if (authorization) {
        headers.Authorization = authorization;
      }

      const versionsUrl = `${this.cristalApp.getWikiConfig().baseURL}${currentId}/versions/`;

      try {
        const response = await fetch(versionsUrl, { headers });
        const jsonResponse = await response.json();

        for (const version of jsonResponse.versions || []) {
          revisions.push({
            version: version.version_id,
            date: new Date(version.last_modified),
            user: {
              name: "",
              profile: "",
            },
            comment: "",
            url: this.cristalApp.getRouter().resolve({
              name: "view",
              params: {
                page: currentId,
                revision: version.version_id,
              },
            }).href,
          });
        }
      } catch (error) {
        this.logger.error(error);
        this.alertsService.error(
          `Could not load page history for ${pageData.name}.`,
        );
      }
    }
    return revisions;
  }
}

export { DocsPageRevisionManager };
