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

import type { PageData } from "@xwiki/cristal-api";
import type { Ref } from "vue";

/**
 * Provide the operation to access a document.
 *
 * @since 0.11
 */
interface DocumentService {
  /**
   * @returns the reference to the current document, the current document changes when setCurrentDocument is called
   */
  getCurrentDocument(): Ref<PageData | undefined>;

  /**
   * @returns the revision of the current document, or undefined if it's the last one
   * @since 0.12
   */
  getCurrentDocumentRevision(): Ref<string | undefined>;

  /**
   * @returns a ref to the loading state. true when the page is loading, false otherwise
   */
  isLoading(): Ref<boolean>;

  /**
   * @returns a ref to the error for the loading of the current document. undefined if no error happened
   */
  getError(): Ref<Error | undefined>;

  /**
   * Update the reference of the latest document.
   * @param documentReference - the current document reference
   * @param revision - the revision of the document, undefined for latest
   */
  setCurrentDocument(documentReference: string, revision?: string): void;

  /**
   * Force reloading the content of the document without changing the current document reference
   */
  refreshCurrentDocument(): void;
}

const name: string = "DocumentService";

export { type DocumentService, name };
