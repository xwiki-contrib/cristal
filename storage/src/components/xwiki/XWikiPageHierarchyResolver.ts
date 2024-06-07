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
 * Implementation of PageHierarchyResolver for the XWiki backend.
 *
 * @since 0.9
 **/
@injectable()
export class XWikiPageHierarchyResolver implements PageHierarchyResolver {
  private wikiConfig: WikiConfig;
  public logger: Logger;
  public defaultHierarchyResolver;

  constructor(
    @inject<Logger>("Logger") logger: Logger,
    @inject("PageHierarchyResolver")
    pageHierarchyResolver: PageHierarchyResolver,
  ) {
    this.logger = logger;
    this.logger.setModule("storage.components.XWikiPageHierarchyResolver");
    this.defaultHierarchyResolver = pageHierarchyResolver;
  }

  setWikiConfig(wikiConfig: WikiConfig): void {
    this.wikiConfig = wikiConfig;
    this.defaultHierarchyResolver.setWikiConfig(wikiConfig);
  }

  async getPageHierarchy(
    pageData: PageData,
  ): Promise<Array<PageHierarchyItem>> {
    const documentId = pageData.document.getIdentifier();
    if (documentId == null) {
      this.logger.debug(
        `No identifier found for page ${pageData.name}, falling back to default hierarchy resolver.`,
      );
      return this.defaultHierarchyResolver.getPageHierarchy(pageData);
    }
    // TODO: support subwikis.
    const restApiUrl = `${this.wikiConfig.baseURL}/rest/wikis/xwiki/spaces/${encodeURIComponent(
      documentId,
    )
      .replace(/((?:%5C%5C)*)%5C./g, "$1%2E")
      .replace(/%5C%5C/g, "%5C")
      .replace(/\.(?=.*\.)/g, "/spaces/")
      .replace(/\./, "/pages/")}`;
    const response = await fetch(restApiUrl, {
      headers: { Accept: "application/json" },
    });
    const jsonResponse = await response.json();
    const hierarchy: Array<PageHierarchyItem> = [];
    jsonResponse.hierarchy.items.forEach(
      (hierarchyItem: { label: string; url: string }) => {
        hierarchy.push({ label: hierarchyItem.label, url: hierarchyItem.url });
      },
    );
    hierarchy[0].label = "Home";
    if (hierarchy[hierarchy.length - 1].url.endsWith("/")) {
      hierarchy.pop();
    }
    return hierarchy;
  }
}
