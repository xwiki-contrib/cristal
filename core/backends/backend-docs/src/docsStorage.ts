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

@injectable()
export class DocsStorage extends AbstractStorage {
  constructor(@inject("Logger") logger: Logger) {
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
  override getPageContent(
    page: string,
    syntax: string,
    revision?: string,
  ): Promise<PageData | undefined> {
    console.log(page, syntax, revision);
    throw new Error("Method not implemented.");
    // TODO
  }
  override getAttachments(page: string): Promise<AttachmentsData | undefined> {
    console.log(page);
    throw new Error("Method not implemented.");
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
