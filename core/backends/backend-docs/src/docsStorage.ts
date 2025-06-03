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

import { BlockNoteEditor } from "@blocknote/core";
import {
  AttachmentsData,
  DefaultPageData,
  PageAttachment,
  PageData,
} from "@xwiki/cristal-api";
import { AbstractStorage } from "@xwiki/cristal-backend-api";
import {
  BlockNoteToUniAstConverter,
  createBlockNoteSchema,
} from "@xwiki/cristal-editors-blocknote-headless";
import {
  UniAstToMarkdownConverter,
  createConverterContext,
} from "@xwiki/cristal-uniast";
import { inject, injectable } from "inversify";
import { Doc, applyUpdate } from "yjs";
import type { CristalApp, Logger } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";

@injectable()
export class DocsStorage extends AbstractStorage {
  constructor(
    @inject("Logger") logger: Logger,
    @inject("AuthenticationManagerProvider")
    private readonly authenticationManagerProvider: AuthenticationManagerProvider,
    @inject("CristalApp") private readonly cristalApp: CristalApp,
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
    if (page === "" || page === "home") {
      const data = new DefaultPageData(page, page, "", syntax);
      data.headline = "Home";
      data.headlineRaw = "Home";
      return data;
    }
    if (page.startsWith("docs-")) {
      let title = page;
      if (page === "docs-my") title = "My Docs";
      else if (page === "docs-all") title = "All Docs";
      else if (page === "docs-shared") title = "Shared Docs";
      const data = new DefaultPageData(page, page, "", syntax);
      data.headline = title;
      data.headlineRaw = title;
      return data;
    }
    const url = `${this.cristalApp.getWikiConfig().baseURL}${page}`;
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
    defaultPageData.source = json.content ? this.convertToDocs(json.content) : "";
    // TODO: many additional metadata need to be initialized
    // TODO: check if it's possible to share a document as readonly
    defaultPageData.id = json.id;
    defaultPageData.canEdit = true;
    defaultPageData.headline = json.title;
    defaultPageData.headlineRaw = json.title;
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
    const url = `${this.cristalApp.getWikiConfig().baseURL}${page}/attachments_list`;
    const response = await fetch(url, {
      headers: {
        ...(await this.getCredentials()),
      },
    });

    const attachments: Array<{id: string, name: string, size: number, mimetype: string, owner: string}> = await response.json()

    return {
      attachments: attachments.map(
        ({ id, name, size, mimetype, owner: author }) => ({
          id,
          name: `attachment:${name}`,
          date: new Date(),
          author,
          href: `${this.cristalApp.getWikiConfig().baseURL}media/${id}`,
          mimetype,
          reference: id,
          size,
        }),
      ),
      count: attachments.length,
    };
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

  private convertToDocs(content: string): string {
    const blocknoteDOM = this.yjsToBlocknoteDOM(content);
    const converterContext = createConverterContext(
      this.cristalApp.getContainer(),
    );
    const res = new BlockNoteToUniAstConverter(converterContext).blocksToUniAst(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blocknoteDOM as any,
    );
    if (res instanceof Error) {
      throw res;
    }

    const toMarkdown = new UniAstToMarkdownConverter(
      converterContext,
    ).toMarkdown(res);
    if (toMarkdown instanceof Error) {
      throw toMarkdown;
    }

    return toMarkdown;
  }

  private yjsToBlocknoteDOM(content: string) {
    const doc = new Doc();
    applyUpdate(doc, this.decodeBase64(content)!);
    const xmlFragment = doc.getXmlFragment("document-store");
    // Creates a headless editor and feed it with the yjs fragment from the backend
    const blockNoteEditor = BlockNoteEditor.create({
      collaboration: {
        provider: undefined,
        user: {
          name: "converter",
          color: "",
        },
        fragment: xmlFragment,
      },
      schema: createBlockNoteSchema(),
    });
    // Mount the editor to a dangling element to trigger to document initialization.
    blockNoteEditor.mount(document.createElement("div"));
    return blockNoteEditor.document;
  }

  private decodeBase64(base64String: string) {
    try {
      // Decode base64 to binary string
      const binaryString = atob(base64String);

      // Convert binary string to UTF-8
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode as UTF-8
      return bytes;
    } catch (error) {
      console.error("Invalid base64 string:", error);
      return undefined;
    }
  }
}
