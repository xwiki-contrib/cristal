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

import type { WikiConfig } from "@xwiki/cristal-api";

/**
 * Returns URL to XWiki spaces rest API for a given document.
 *
 * @param wikiConfig - the current wiki configuration
 * @param documentId - the id of the document
 * @returns the crafted URL
 * @since 0.9
 */
export function getRestSpacesApiUrl(
  wikiConfig: WikiConfig,
  documentId: string,
): string {
  const splittedDocumentId = documentId.split(":");
  const wiki = splittedDocumentId.length > 1 ? splittedDocumentId[0] : "xwiki";
  const doc =
    splittedDocumentId.length > 1
      ? splittedDocumentId[1]
      : splittedDocumentId[0];
  return `${wikiConfig.baseURL}/rest/wikis/${wiki}/spaces/${encodeURIComponent(
    doc,
  )
    .replace(/((?:%5C%5C)*)%5C\./g, "$1%2E") // Unescape dots in identifiers
    .replace(/%5C%5C/g, "%5C") // Unescape backslashes in identifiers
    .replace(/\.(?=.*\.)/g, "/spaces/") // Transform separators to spaces endpoints
    .replace(/\./, "/pages/")}`; // Transform last separator to pages endpoint
}
