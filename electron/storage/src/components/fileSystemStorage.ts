/**
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 * This file is part of the Cristal Wiki software prototype
 * @copyright  Copyright (c) 2023 XWiki SAS
 * @license    http://opensource.org/licenses/AGPL-3.0 AGPL-3.0
 *
 **/

import { inject, injectable } from "inversify";
import { DefaultPageData, Logger, PageData } from "@xwiki/cristal-api";
import { AbstractStorage } from "@xwiki/cristal-storage";
import { APITypes } from "../electron/preload/apiTypes";

declare const fileSystemStorage: APITypes;

@injectable()
export default class FileSystemStorage extends AbstractStorage {
  constructor(@inject<Logger>("Logger") logger: Logger) {
    super(logger, "storage.components.fileSystemStorage");
  }

  getEditField(): Promise<string> {
    return Promise.resolve("");
  }

  getImageURL(): string {
    return "";
  }

  async getPageContent(page: string, syntax: string): Promise<PageData> {
    const decodedPage = decodeURIComponent(page);
    const path = await fileSystemStorage.resolvePath(decodedPage, syntax);
    const pageData = await fileSystemStorage.readPage(path || "");
    if (pageData) {
      pageData.id = decodedPage;
      pageData.headline = pageData.name;
      pageData.headlineRaw = pageData.name;
    }
    return pageData;
  }

  getPageFromViewURL(): string | null {
    return null;
  }

  getPageRestURL(): string {
    return "";
  }

  getPanelContent(): Promise<PageData> {
    return Promise.resolve(new DefaultPageData());
  }

  isStorageReady(): Promise<boolean> {
    return Promise.resolve(true);
  }

  async save(page: string, content: string, title: string, syntax: string) {
    const path = await fileSystemStorage.resolvePath(page, syntax);
    await fileSystemStorage.savePage(path, content, title);
  }
}
