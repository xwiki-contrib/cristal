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
import type { Logger } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";

@injectable()
export class DocsStorage extends AbstractStorage {
  constructor(
    @inject("Logger") logger: Logger,
    @inject("AuthenticationManagerProvider")
    private readonly authenticationManagerProvider: AuthenticationManagerProvider,
  ) {
    super(logger, "storage.components.docsStorage");
  }

  override async getEditField(): Promise<string> {
    // TODO: unsupported
    return "";
  }
  override getImageURL(): string {
    // TODO: unsupported
    return "";
  }
  override async getPageContent(
    page: string,
    syntax: string,
    revision?: string,
  ): Promise<PageData | undefined> {
    console.log("getPageContent", page, syntax, revision);
    const url = `http://localhost:8071/api/v1.0/documents/${page}/`;
    const response = await fetch(url, {
      headers: {
        ...(await this.getCredentials()),
      },
    });

    // TODO:
    // Example of url http://localhost:5173/Docs/#/7fa9e527-1157-4fba-a6c9-5494706213d9/
    // Most of the logic should be close to  XWikiStorage but with the endpoints documented in the cryptpad doc
    const json = await response.json();
    const defaultPageData = new DefaultPageData();
    // TODO: the content is not using the right format, we need to decide where to make the conversion
    defaultPageData.source = json.content;
    // TODO: many additional metadata need to be initialized
    // TODO: check if it's possible to share a document as readnly
    defaultPageData.canEdit = true;
    return defaultPageData;
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

  override async getAttachments(page: string): Promise<AttachmentsData | undefined> {
    const url = `http://localhost:8071/api/v1.0/documents/${page}/attachments_list`;
    const response = await fetch(url, {
      headers: {
        ...(await this.getCredentials()),
      },
    });

    const attachments: Array<{id: string, name: string, size: number, mimetype: string, owner: string}> = await response.json()

    return {
      attachments: attachments.map(({ id, name, size, mimetype, owner: author }) => ({
        id,
        name: `attachment:${name}`,
        date: new Date(),
        author,
        href: `http://localhost:8083/media/${id}`,
        mimetype,
        reference: id,
        size
      })),
      count: attachments.length
    }
  }
  override getAttachment(
    page: string,
    name: string,
  ): Promise<PageAttachment | undefined> {
    console.log(page, name);
    throw new Error("Method not implemented.");
  }
  override getPageFromViewURL(): string | null {
    // FIXME: unused for many backends
    return null;
  }
  override getPageRestURL(): string {
    // FIXME: unused for many backends
    return "";
  }
  override async getPanelContent(): Promise<PageData> {
    // TODO: unsupported
    return new DefaultPageData();
  }
  override isStorageReady(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  override save(
    page: string,
    title: string,
    content: string,
    syntax: string,
  ): Promise<unknown> {
    console.log(page, title, content, syntax);
    throw new Error("Method not implemented.");
  }
  override saveAttachments(page: string, files: File[]): Promise<unknown> {
    console.log(page, files);
    throw new Error("Method not implemented.");
  }
  override delete(page: string): Promise<{ success: boolean; error?: string }> {
    console.log(page);
    throw new Error("Method not implemented.");
  }
  override move(
    page: string,
    newPage: string,
    preserveChildren: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    console.log(page, newPage, preserveChildren);
    throw new Error("Method not implemented.");
  }
}
