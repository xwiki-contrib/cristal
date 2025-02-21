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

import {
  AttachmentsData,
  DefaultPageData,
  PageAttachment,
  PageData,
} from "@xwiki/cristal-api";
import { AbstractStorage } from "@xwiki/cristal-backend-api";
import { inject, injectable } from "inversify";
import type { AlertsServiceProvider } from "@xwiki/cristal-alerts-api";
import type { Logger } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";

@injectable()
export class GitHubStorage extends AbstractStorage {
  constructor(
    @inject<Logger>("Logger") logger: Logger,
    @inject<AuthenticationManagerProvider>("AuthenticationManagerProvider")
    private readonly authenticationManagerProvider: AuthenticationManagerProvider,
    @inject<AlertsServiceProvider>("AlertsServiceProvider")
    private readonly alertsServiceProvider: AlertsServiceProvider,
  ) {
    super(logger, "storage.components.githubStorage");
  }

  public async isStorageReady(): Promise<boolean> {
    return true;
  }

  getPageRestURL(page: string, _syntax: string, revision?: string): string {
    this.logger?.debug("GitHub Loading page", page);
    let baseRestURL = `${this.wikiConfig.baseRestURL}contents/${page}`;
    if (revision) {
      baseRestURL = `${baseRestURL}?ref=${revision}`;
    }
    return baseRestURL;
  }

  getPageFromViewURL(url: string): string | null {
    let page = null;
    if (url.startsWith(this.wikiConfig.baseURL)) {
      const uri = url.replace(this.wikiConfig.baseURL, "");
      page = uri;
    }
    return page;
  }

  getImageURL(page: string, image: string): string {
    const directory = page.replace(/[^/]*$/, "");
    return `${this.wikiConfig.baseURL}${directory}${image}`;
  }

  hashCode = function (str: string): string {
    let hash = 0,
      i,
      chr;
    if (str.length === 0) {
      return "" + hash;
    }
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return "" + hash;
  };

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async getPageContent(
    page: string,
    syntax: string,
    revision?: string,
  ): Promise<PageData | undefined> {
    this.logger?.debug("GitHub Loading page", page);
    const url = this.getPageRestURL(page, syntax, revision);
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        ...(await this.getCredentials()),
        Accept: `application/vnd.github.${syntax == "html" ? "html" : "raw"}+json`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      const pageContentData = new DefaultPageData();

      pageContentData.id = page;
      pageContentData.name = page.split("/").pop()!;

      // A JSON content type means the requested page was a folder,
      // and we don't want to display the response as content.
      if (
        response.headers.get("Content-Type") ==
        "application/json; charset=utf-8"
      ) {
        pageContentData.canEdit = false;
      } else {
        const text = await response.text();

        pageContentData.source = text;
        if (syntax == "html") {
          pageContentData.syntax = "html";
          pageContentData.html = text;
        } else {
          pageContentData.syntax = "md";
        }
        pageContentData.css = [];
        pageContentData.version = this.hashCode(text);
        pageContentData.canEdit =
          (await this.authenticationManagerProvider.get()?.isAuthenticated()) ??
          false;
      }

      return pageContentData;
    } else {
      return undefined;
    }
  }

  /**
   * @since 0.9
   */
  getAttachments(): Promise<AttachmentsData | undefined> {
    // TODO: to be implemented.
    throw new Error("unsupported");
  }

  getAttachment(): Promise<PageAttachment | undefined> {
    // TODO: to be implemented.
    throw new Error("unsupported");
  }

  async getPanelContent(): Promise<PageData> {
    return new DefaultPageData();
  }

  async getEditField(): Promise<string> {
    return "";
  }

  async save(page: string, content: string): Promise<unknown> {
    const pageRestUrl = this.getPageRestURL(page, "");

    const headResponse = await fetch(pageRestUrl, {
      method: "HEAD",
      cache: "no-store",
      headers: {
        ...(await this.getCredentials()),
        Accept: "application/vnd.github.object+json",
      },
    });
    const sha =
      headResponse.status >= 200 && headResponse.status < 300
        ? headResponse.headers.get("ETag")!.slice(3, -1)
        : undefined;

    const putResponse = await fetch(pageRestUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(await this.getCredentials()),
      },
      body: JSON.stringify({
        content: btoa(content),
        message: `Update ${page}`,
        sha: sha,
      }),
    });
    if (!putResponse.ok) {
      const errorMessage = await putResponse.text();
      // TODO: Fix CRISTAL-383 (Error messages in Storages are not translated)
      this.alertsServiceProvider
        .get()
        .error(`Could not save page ${page}. Reason: ${errorMessage}`);
      // We need to throw an error to notify the editor that the save failed.
      throw new Error(errorMessage);
    }
    return;
  }

  async saveAttachments(): Promise<unknown> {
    // TODO: to be implemented
    throw new Error("unsupported");
  }

  async delete(page: string): Promise<{ success: boolean; error?: string }> {
    const pageRestUrl = this.getPageRestURL(page, "");

    const headResponse = await fetch(pageRestUrl, {
      method: "HEAD",
      cache: "no-store",
      headers: {
        ...(await this.getCredentials()),
        Accept: "application/vnd.github.object+json",
      },
    });
    const sha =
      headResponse.status >= 200 && headResponse.status < 300
        ? headResponse.headers.get("ETag")!.slice(3, -1)
        : undefined;

    const success = await fetch(pageRestUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(await this.getCredentials()),
      },
      body: JSON.stringify({
        message: `Delete ${page}`,
        sha: sha,
      }),
    }).then(async (response) => {
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: await response.text() };
      }
    });

    return success;
  }

  async move(): Promise<{ success: boolean; error?: string }> {
    // TODO: to be implemented in CRISTAL-436.
    throw new Error("Move not supported");
  }

  private async getCredentials(): Promise<{ Authorization?: string }> {
    const authorizationHeader = await this.authenticationManagerProvider
      .get()
      ?.getAuthorizationHeader();
    const headers: { Authorization?: string } = {};
    if (authorizationHeader) {
      headers["Authorization"] = authorizationHeader;
    }
    return headers;
  }
}
