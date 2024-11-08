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

import type { PageData } from "@xwiki/cristal-api";

/**
 * Description of a revision for a given page.
 * @since 0.12
 */
type PageRevision = {
  version: string;
  date: Date;
  user: string; // TODO: replace by an actual User instance.
  comment: string;
  url: string;
};

/**
 * A PageRevisionManager returns the existing revisions for a given page.
 *
 * @since 0.12
 **/
interface PageRevisionManager {
  /**
   * Returns the revisions for a given page.
   *
   * @param pageData - the page for which to get the revisions
   * @returns the page revisions
   */
  getRevisions(pageData: PageData): Promise<Array<PageRevision>>;
}

/**
 * A PageRevisionManagerProvider returns the instance of PageRevisionManager
 * matching the current wiki configuration.
 *
 * @since 0.12
 **/
interface PageRevisionManagerProvider {
  /**
   * Returns the instance of PageRevisionManager matching the current wiki
   * configuration.
   *
   * @returns the instance of PageRevisionManager
   */
  get(): PageRevisionManager;
}

/**
 * The component id of PageRevisionManager.
 * @since 0.12
 */
const name = "PageRevisionManager";

export {
  type PageRevision,
  type PageRevisionManager,
  type PageRevisionManagerProvider,
  name,
};
