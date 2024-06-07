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

import type { PageData } from "./PageData";
import type { WikiConfig } from "./WikiConfig";

export type PageHierarchyItem = {
  label: string;
  url: string;
};

/**
 * A PageHierarchyResolver computes and returns the hierarchy for a given page.
 *
 * @since 0.9
 **/
export interface PageHierarchyResolver {
  /**
   * Sets the current wiki configuration. Should always be called after component initialization.
   *
   * @param config the current wiki configuration
   */
  setWikiConfig(config: WikiConfig): void;

  /**
   * Returns the page hierarchy for a given page.
   *
   * @param pageData the page for which to compute the hierarchy
   * @returns the page hierarchy
   */
  getPageHierarchy(pageData: PageData): Promise<Array<PageHierarchyItem>>;
}
