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

// import { name as NavigationTreeSourceName } from "@xwiki/cristal-navigation-tree-api";
import { inject, injectable } from "inversify";
import type { CristalApp, Logger } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";
import type { DocumentReference } from "@xwiki/cristal-model-api";
// import type { ModelReferenceSerializer } from "@xwiki/cristal-model-reference-api";
// import type { RemoteURLParser } from "@xwiki/cristal-model-remote-url-api";
import {
  NavigationTreeNode,
  NavigationTreeSource,
} from "@xwiki/cristal-navigation-tree-api";
import { SpaceReference } from "@xwiki/cristal-model-api";

@injectable()
export class DocsNavigationTreeSource implements NavigationTreeSource {
  constructor(
    @inject("Logger") private readonly logger: Logger,
    @inject("CristalApp") private readonly cristalApp: CristalApp,
    @inject("AuthenticationManagerProvider")
    private authenticationManagerProvider: AuthenticationManagerProvider,
    // @inject("RemoteURLParser") @named("XWiki") private readonly urlParser: RemoteURLParser,
    /* @inject("ModelReferenceSerializer")
    @named("Docs")
    private readonly referenceSerializer: ModelReferenceSerializer,
    */
  ) {
    this.logger.setModule(
      "navigation-tree-docs.components.DocsNavigationTreeSource",
    );
    console.log("DocsNavTree: In NavTree constructor");
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async getChildNodes(id?: string): Promise<Array<NavigationTreeNode>> {
    console.log("DocsNavTree: In getChildNodes");
    const currentId = id ? id : "#";
    const navigationTree: Array<NavigationTreeNode> = [];

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

      navigationTree.push(...(await this.fetchNodes(currentId, headers, 0)));
    } catch (error) {
      this.logger.error(error);
      this.logger.debug("Could not load navigation tree.");
    }
    return navigationTree;
  }

  getParentNodesId(
    page: DocumentReference,
    includeTerminal: boolean = true,
  ): Array<string> {
    console.log("DocsNavTree: In getParentChildNodes");

    const result = [];
    if (page.space) {
      let currentParent = "";
      for (const parent of page.space!.names) {
        currentParent += parent;
        // TODO: Support subwikis.
        result.push(`document:xwiki:${currentParent}.WebHome`);
        currentParent += ".";
      }
      /*
      if (page.name != "WebHome" && includeTerminal) {
        result.push(
          `document:xwiki:${this.referenceSerializer.serialize(page)}`,
        );
      }
      */
    }
    return result;
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  private async fetchNodes(
    currentId: string,
    headers: { Accept: string; Authorization?: string },
    offset: number,
  ): Promise<Array<NavigationTreeNode>> {
    if (currentId === "#") {
      return [
        {
          id: "docs-my",
          label: "My Docs",
          location: new SpaceReference(undefined, "MyDocs"),
          url: "#docs-my",
          has_children: true,
          is_terminal: false,
        },
        {
          id: "docs-shared",
          label: "Shared Docs",
          location: new SpaceReference(undefined, "SharedDocs"),
          url: "#docs-shared",
          has_children: true,
          is_terminal: false,
        },
        {
          id: "docs-all",
          label: "All Docs",
          location: new SpaceReference(undefined, "AllDocs"),
          url: "#docs-all",
          has_children: true,
          is_terminal: false,
        },
      ];
    }
    if (currentId === "docs-my" || currentId === "docs-shared" || currentId === "docs-all") {
      const url = this.cristalApp.getWikiConfig().baseURL;
      let endpoint = "?page=1";
      if (currentId === "docs-my") {
        endpoint += "&is_creator_me=true";
      } else if (currentId === "docs-shared") {
        endpoint += "&is_creator_me=false";
      }
      const response = await fetch(url + endpoint, { headers });
      const json = await response.json();
      // Assuming json.results is an array of documents
      return (json.results || []).map((doc: any) => ({
        id: doc.id,
        label: doc.title || doc.id,
        location: new SpaceReference(undefined, ...(doc.id || "").split(".")),
        url: `#${doc.id}`,
        has_children: false, // or true if you want to support children
        is_terminal: true, // or false if not a leaf
      }));
    }
    return [];
  }
}
