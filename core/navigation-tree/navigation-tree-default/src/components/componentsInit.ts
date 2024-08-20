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

import { Container, inject, injectable } from "inversify";
import type { CristalApp, Logger } from "@xwiki/cristal-api";
import {
  name as NavigationTreeResolverName,
  type NavigationTreeNode,
  type NavigationTreeResolver,
  type NavigationTreeResolverProvider,
} from "@xwiki/cristal-navigation-tree-api";

/**
 * Default implementation for NavigationTreeResolver.
 *
 * @since 0.10
 **/
@injectable()
class DefaultNavigationTreeResolver implements NavigationTreeResolver {
  private cristalApp: CristalApp;
  public logger: Logger;

  constructor(
    @inject<Logger>("Logger") logger: Logger,
    @inject<CristalApp>("CristalApp") cristalApp: CristalApp,
  ) {
    this.logger = logger;
    this.logger.setModule(
      "navigation-tree-default.components.DefaultNavigationTreeResolver",
    );
    this.cristalApp = cristalApp;
  }

  async getNavigationTree(id?: string): Promise<Array<NavigationTreeNode>> {
    id = id ? id : "";
    const pageData = await this.cristalApp.getPage(id);
    return [
      {
        id: id,
        label: pageData ? pageData.name : "Home",
        url: this.cristalApp.getRouter().resolve({
          name: "view",
          params: {
            page: this.cristalApp.getWikiConfig().homePage,
          },
        }).href,
        has_children: false,
      },
    ];
  }
}

/**
 * Default implementation for NavigationTreeResolverProvider.
 *
 * @since 0.10
 **/
@injectable()
class DefaultNavigationTreeResolverProvider
  implements NavigationTreeResolverProvider
{
  private cristalApp: CristalApp;
  public logger: Logger;

  constructor(
    @inject<Logger>("Logger") logger: Logger,
    @inject<CristalApp>("CristalApp") cristalApp: CristalApp,
  ) {
    this.logger = logger;
    this.logger.setModule(
      "core.navigation-tree.navigation-tree-default.DefaultNavigationTreeResolver",
    );
    this.cristalApp = cristalApp;
  }

  get(): NavigationTreeResolver {
    const container = this.cristalApp.getContainer();
    const wikiConfigType = this.cristalApp.getWikiConfig().getType();
    if (container.isBoundNamed(NavigationTreeResolverName, wikiConfigType)) {
      return container.getNamed<NavigationTreeResolver>(
        NavigationTreeResolverName,
        wikiConfigType,
      );
    } else {
      return container.get<NavigationTreeResolver>(NavigationTreeResolverName);
    }
  }
}

export class ComponentInit {
  constructor(container: Container) {
    container
      .bind<NavigationTreeResolver>(NavigationTreeResolverName)
      .to(DefaultNavigationTreeResolver)
      .inSingletonScope()
      .whenTargetIsDefault();
    container
      .bind<NavigationTreeResolverProvider>(
        `${NavigationTreeResolverName}Provider`,
      )
      .to(DefaultNavigationTreeResolverProvider)
      .inSingletonScope()
      .whenTargetIsDefault();
  }
}
