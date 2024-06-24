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

import { Ref } from "vue";

/**
 * @since 0.9
 */
interface Attachment {
  id: string;
  name: string;
  mimetype: string;
  href: string;
}

/**
 * @since 0.9
 */
interface AttachmentsService {
  list(): Ref<Attachment[]>;
  isLoading(): Ref<boolean>;

  /**
   * True while an attachment is uploading.
   */
  isUploading(): Ref<boolean>;
  getError(): Ref<string | undefined>;

  /**
   * Load the initial state of the attachments.
   */
  refresh(page: string): void;

  /**
   * Upload the provided list of files to a given page
   * @param page the page where to save the files
   * @param files the list of files to upload
   */
  upload(page: string, files: File[]): Promise<void>;
}

export type { AttachmentsService, Attachment };
