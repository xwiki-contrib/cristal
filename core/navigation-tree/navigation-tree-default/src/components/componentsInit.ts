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

import { getParentNodesIdFromPath } from "../utils";
import { name as NavigationTreeSourceName } from "@xwiki/cristal-navigation-tree-api";
import { Container, inject, injectable } from "inversify";
import type { CristalApp, Logger } from "@xwiki/cristal-api";
import type { DocumentReference } from "@xwiki/cristal-model-api";
import type {
  NavigationTreeNode,
  NavigationTreeSource,
  NavigationTreeSourceProvider,
} from "@xwiki/cristal-navigation-tree-api";

/**
 * Default implementation for NavigationTreeSource.
 *
 * @since 0.10
 **/
@injectable()
class DefaultNavigationTreeSource implements NavigationTreeSource {
  public logger: Logger;

  constructor(@inject("Logger") logger: Logger) {
    this.logger = logger;
    this.logger.setModule(
      "navigation-tree-default.components.DefaultNavigationTreeSource",
    );
  }

  async getChildNodes(): Promise<Array<NavigationTreeNode>> {
    return [];
  }

  getParentNodesId(
    page: DocumentReference,
    _includeTerminal?: boolean,
    includeRootNode?: boolean,
  ): Array<string> {
    // The default implementation does not handle terminal pages.
    return getParentNodesIdFromPath(page, includeRootNode);
  }
}

/**
 * Default implementation for NavigationTreeSourceProvider.
 *
 * @since 0.10
 **/
@injectable()
class DefaultNavigationTreeSourceProvider
  implements NavigationTreeSourceProvider
{
  private cristalApp: CristalApp;
  public logger: Logger;

  constructor(
    @inject("Logger") logger: Logger,
    @inject("CristalApp") cristalApp: CristalApp,
  ) {
    this.logger = logger;
    this.logger.setModule(
      "core.navigation-tree.navigation-tree-default.DefaultNavigationTreeSource",
    );
    this.cristalApp = cristalApp;
  }

  get(): NavigationTreeSource {
    const container = this.cristalApp.getContainer();
    const wikiConfigType = this.cristalApp.getWikiConfig().getType();
    if (container.isBound(NavigationTreeSourceName, { name: wikiConfigType })) {
      return container.get<NavigationTreeSource>(NavigationTreeSourceName, {
        name: wikiConfigType,
      });
    } else {
      return container.get<NavigationTreeSource>(NavigationTreeSourceName);
    }
  }
}

export class ComponentInit {
  constructor(container: Container) {
    container
      .bind<NavigationTreeSource>(NavigationTreeSourceName)
      .to(DefaultNavigationTreeSource)
      .inSingletonScope()
      .whenDefault();
    container
      .bind<NavigationTreeSourceProvider>(`${NavigationTreeSourceName}Provider`)
      .to(DefaultNavigationTreeSourceProvider)
      .inSingletonScope()
      .whenDefault();
  }
}
