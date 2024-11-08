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

import { name as PageRevisionManagerName } from "@xwiki/cristal-history-api";
import { inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type {
  PageRevision,
  PageRevisionManager,
  PageRevisionManagerProvider,
} from "@xwiki/cristal-history-api";

/**
 * Default implementation for PageRevisionManager.
 * This is a fallback that only returns an empty history.
 *
 * @since 0.12
 **/
@injectable()
class DefaultPageRevisionManager implements PageRevisionManager {
  async getRevisions(): Promise<Array<PageRevision>> {
    return [];
  }
}

/**
 * Default implementation for PageRevisionManagerProvider.
 *
 * @since 0.12
 **/
@injectable()
class DefaultPageRevisionManagerProvider
  implements PageRevisionManagerProvider
{
  private cristalApp: CristalApp;

  constructor(@inject<CristalApp>("CristalApp") cristalApp: CristalApp) {
    this.cristalApp = cristalApp;
  }

  get(): PageRevisionManager {
    const container = this.cristalApp.getContainer();
    const wikiConfigType = this.cristalApp.getWikiConfig().getType();
    if (container.isBoundNamed(PageRevisionManagerName, wikiConfigType)) {
      return container.getNamed<PageRevisionManager>(
        PageRevisionManagerName,
        wikiConfigType,
      );
    } else {
      return container.get<PageRevisionManager>(PageRevisionManagerName);
    }
  }
}

export { DefaultPageRevisionManager, DefaultPageRevisionManagerProvider };
