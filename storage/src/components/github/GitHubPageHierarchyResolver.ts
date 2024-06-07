/**
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 * This file is part of the Cristal Wiki software prototype
 * @copyright  Copyright (c) 2023 XWiki SAS
 * @license    http://opensource.org/licenses/AGPL-3.0 AGPL-3.0
 *
 **/
import { inject, injectable } from "inversify";
import {
  type PageData,
  type Logger,
  type PageHierarchyItem,
  type WikiConfig,
  type PageHierarchyResolver,
} from "@xwiki/cristal-api";

/**
 * Implementation of PageHierarchyResolver for the GitHub backend.
 *
 * @since 0.9
 **/
@injectable()
export class GitHubPageHierarchyResolver implements PageHierarchyResolver {
  private wikiConfig: WikiConfig;
  public logger: Logger;

  constructor(@inject<Logger>("Logger") logger: Logger) {
    this.logger = logger;
    this.logger.setModule("storage.components.FileSystemPageHierarchyResolver");
  }

  setWikiConfig(wikiConfig: WikiConfig): void {
    this.wikiConfig = wikiConfig;
  }

  async getPageHierarchy(
    pageData: PageData,
  ): Promise<Array<PageHierarchyItem>> {
    const baseURL = `/${this.wikiConfig.name}/#`;
    const hierarchy: Array<PageHierarchyItem> = [
      {
        label: "Home",
        url: `${baseURL}/${this.wikiConfig.homePage}/view`,
      },
    ];
    if (pageData != null) {
      const fileHierarchy = pageData.id.split("/");
      let currentFile = "";
      for (let i = 0; i < fileHierarchy.length; i++) {
        const file = fileHierarchy[i];
        currentFile += `${i == 0 ? "" : "/"}${file}`;
        const currentURI = encodeURIComponent(currentFile);
        hierarchy.push({
          label: file,
          url: `${baseURL}/${currentURI}/view`,
        });
      }
    }
    return hierarchy;
  }
}
