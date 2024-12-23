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
  Document,
  JSONLDDocument,
  PageAttachment,
  PageData,
} from "@xwiki/cristal-api";
import { AbstractStorage } from "@xwiki/cristal-backend-api";
import { getRestSpacesApiUrl } from "@xwiki/cristal-xwiki-utils";
import { inject, injectable } from "inversify";
import type { AlertsServiceProvider } from "@xwiki/cristal-alerts-api";
import type { Logger } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";

/**
 * The type of individual attachments.
 * @since 0.9
 */
type Attachment = {
  id: string;
  name: string;
  size: number;
  longSize: number;
  version: string;
  pageId: string;
  pageVersion: string;
  mimeType: string;
  author: string;
  authorName: string | null;
  date: Date;
  xwikiRelativeUrl: string;
  xwikiAbsoluteUrl: string;
  // TODO: add hierarchy
};

/**
 * The attachments rest response type
 * @since 0.9
 */
type AttachmentsRest = {
  attachments: Attachment[];
};

@injectable()
export class XWikiStorage extends AbstractStorage {
  constructor(
    @inject<Logger>("Logger") logger: Logger,
    @inject<AuthenticationManagerProvider>("AuthenticationManagerProvider")
    private authenticationManagerProvider: AuthenticationManagerProvider,
    @inject<AlertsServiceProvider>("AlertsServiceProvider")
    private readonly alertsServiceProvider: AlertsServiceProvider,
  ) {
    super(logger, "storage.components.xwikiStorage");
  }

  public async isStorageReady(): Promise<boolean> {
    return true;
  }

  getPageRestURL(page: string, syntax: string, revision?: string): string {
    this.logger?.debug("XWiki Loading page", page);
    const url = new URL(this.wikiConfig.baseURL + this.wikiConfig.baseRestURL);
    const searchParams = new URLSearchParams([
      ["page", page],
      ["format", syntax],
    ]);
    if (revision) {
      searchParams.append("revision", revision);
    }
    url.search = searchParams.toString();
    return url.toString();
  }

  getPageFromViewURL(url: string): string | null {
    let page: string | null;
    if (url.startsWith(this.wikiConfig.baseURL)) {
      const uri = url.replace(this.wikiConfig.baseURL, "");
      page = uri
        .replace("/bin", "")
        .replace("/view/", "")
        .replaceAll("%5C", "%5C%5C") // Escape backslashes in identifiers
        .replaceAll(".", "%5C.") // Escape dots in identifiers
        .replaceAll("/", "."); // Convert separators from slashes to dots
      if (page.endsWith(".")) {
        page += "WebHome";
      }
      page = decodeURIComponent(page);
    } else {
      page = null;
    }
    return page;
  }

  getImageURL(page: string, image: string): string {
    if (page == "") {
      page = "Main.WebHome";
    }
    const imageURL =
      this.wikiConfig.baseURL +
      "/bin/download/" +
      page.replace(".", "/") +
      "/" +
      image;
    this.logger?.debug("final image url ", imageURL);
    return imageURL;
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async getPageContent(
    page: string,
    syntax: string,
    revision?: string,
  ): Promise<PageData | undefined> {
    this.logger?.debug("XWiki Loading page", page);
    if (page == "") {
      page = "Main.WebHome";
    }
    const url = this.getPageRestURL(page, syntax, revision);
    this.logger?.debug("XWiki Loading url", url);
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        ...(await this.getCredentials()),
      },
    });
    let json;
    try {
      json = await response.json();
      if (!response.ok) {
        // TODO: Fix CRISTAL-383 (Error messages in Storages are not translated)
        this.alertsServiceProvider
          .get()
          .error(`Could not load page ${page}. Reason: ${json.error}`);
        return undefined;
      }
    } catch {
      // Return undefined in case of missing page.
      return undefined;
    }
    let source = "";
    let html = "";
    let jsonContent = {};
    if (syntax == "jsonld") {
      jsonContent = json;
      if (this.wikiConfig.serverRendering) {
        this.logger?.debug("Using server side rendering for jsonld");
        source = json.source;
        html = json.html;
      } else {
        this.logger?.debug("Using client side rendering for jsonld");
        source = json.source;
        html = "";
      }
    } else if (syntax == "html") {
      if (this.wikiConfig.serverRendering) {
        this.logger?.debug("Using server side rendering for html");
        source = json.source;
        html = "";
      } else {
        this.logger?.debug("Using client side rendering for html");
        source = json.source;
        html = "";
      }
    } else {
      source = "";
      html = "";
    }

    const pageContentData = new DefaultPageData();
    pageContentData.source = source;
    pageContentData.syntax = "xwiki";
    pageContentData.html = html;
    pageContentData.document = new JSONLDDocument(jsonContent);
    pageContentData.css = json.css;
    pageContentData.js = json.js;
    pageContentData.version = pageContentData.document.get("version");
    pageContentData.headlineRaw = json.headlineRaw;
    pageContentData.headline = json.headline;
    pageContentData.name = json.name;
    pageContentData.lastModificationDate = new Date(
      Date.parse(json.dateModified),
    );
    pageContentData.lastAuthor = { name: json.editor };
    pageContentData.canEdit = json.canEdit;
    return pageContentData;
  }

  async getAttachments(page: string): Promise<AttachmentsData | undefined> {
    const response = await fetch(this.buildAttachmentsURL(page), {
      headers: { Accept: "application/json", ...(await this.getCredentials()) },
    });
    const json: AttachmentsRest = await response.json();
    const attachments = json.attachments.map(
      ({ id, name, mimeType, xwikiAbsoluteUrl, size, date, author }) => {
        return {
          id,
          reference: name,
          mimetype: mimeType,
          href: xwikiAbsoluteUrl,
          size,
          date,
          author,
        };
      },
    );
    // TODO: It's currently not possible to get the attachment count from
    // XWiki's rest endpoints without asking for the full list of attachments
    // of a page (see XWIKI-22297).
    return { attachments };
  }

  async getAttachment(
    page: string,
    name: string,
  ): Promise<PageAttachment | undefined> {
    const attachments = await this.getAttachments(page);
    if (attachments) {
      return attachments.attachments.filter((a) => a.reference == name)[0];
    }
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async getPanelContent(panel: string, contextPage: string): Promise<PageData> {
    const url =
      this.wikiConfig.baseURL +
      "/rest/cristal/panel?media=json" +
      "&page=" +
      contextPage +
      "&panel=" +
      panel;
    this.logger?.debug("XWiki Loading url", url);
    const response = await fetch(url, { cache: "no-store" });
    const json = await response.json();
    const panelContentData = new DefaultPageData();
    panelContentData.source = json.source;
    panelContentData.syntax = "xwiki";
    panelContentData.html = json.content;
    panelContentData.css = json.css;
    panelContentData.js = json.js;
    return panelContentData;
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async getEditField(document: Document, fieldName: string): Promise<string> {
    // http://localhost:15680/xwiki/bin/get/Blog/BlogIntroduction?xpage=display&mode=edit&property=Blog.BlogPostClass.category
    // http://localhost:15680/xwiki/bin/get/Help/Applications/Movies/Modern%20Times?xpage=display&mode=edit&property=Help.Applications.Movies.Code.MoviesClass%5B0%5D.staticList1&type=object&language=
    //
    try {
      // TODO get rid of any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fieldMapping: any = document.get("xwikiMapping")[fieldName];
      let type = fieldMapping["type"];
      let xwikiFieldName = fieldMapping["fieldName"];
      if (type == null) {
        type = "document";
      }
      if (xwikiFieldName == null) {
        xwikiFieldName = fieldName;
      }
      const url =
        this.wikiConfig.baseURL +
        "/bin/get/" +
        document.getIdentifier().replaceAll(".", "/") +
        "?xpage=display&mode=edit&type=" +
        type +
        "&property=" +
        document.get("className") +
        "." +
        xwikiFieldName;
      this.logger?.debug("XWiki Loading Field url", url);
      const response = await fetch(url, { cache: "no-store" });
      return await response.text();
    } catch (e) {
      this.logger?.error(
        "Exception looking for edit field for field",
        fieldName,
        e,
      );
      return "";
    }
  }

  async save(page: string, content: string, title: string): Promise<unknown> {
    const url = this.buildSavePageURL(page, ["rest", "wikis", "xwiki"]);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(await this.getCredentials()),
      },
      // TODO: the syntax provided by the save is ignored and the content is always saved as markdown.
      body: JSON.stringify({ content, title, syntax: "markdown/1.2" }),
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      // TODO: Fix CRISTAL-383 (Error messages in Storages are not translated)
      this.alertsServiceProvider
        .get()
        .error(`Could not save page ${page}. Reason: ${errorMessage}`);
      // We need to throw an error to notify the editor that the save failed.
      throw new Error(errorMessage);
    }

    return;
  }

  async saveAttachments(page: string, files: File[]): Promise<unknown> {
    return Promise.all(files.map((file) => this.saveAttachment(page, file)));
  }

  async saveAttachment(page: string, file: File): Promise<unknown> {
    const response = await fetch(
      `${this.buildAttachmentsURL(page)}/${file.name}`,
      {
        method: "PUT",
        body: file,
        headers: {
          ...(await this.getCredentials()),
          "Content-Type": file.type,
        },
      },
    );
    if (!response.ok) {
      // TODO: make translatable and adapt technical error messages from the backend to human readable errors.
      throw new Error(
        `Failed to upload the attachment. Reason: [${response.statusText}]`,
      );
    }
    return;
  }

  async delete(page: string): Promise<{ success: boolean; error?: string }> {
    const url = this.buildSavePageURL(page, ["rest", "wikis", "xwiki"]);

    const success = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(await this.getCredentials()),
      },
    }).then(async (response) => {
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: await response.text() };
      }
    });

    return success;
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

  private buildSavePageURL(page: string, segments: string[]) {
    const url = this.wikiConfig.baseURL;
    const referenceParts = page.split(".");
    for (let i = 0; i < referenceParts.length; i++) {
      const segment = i < referenceParts.length - 1 ? "spaces" : "pages";
      segments.push(segment);
      segments.push(referenceParts[i]);
    }

    return `${url}/${segments.join("/")}`;
  }

  private buildAttachmentsURL(page: string) {
    return `${getRestSpacesApiUrl(this.wikiConfig, page)}/attachments`;
  }
}
