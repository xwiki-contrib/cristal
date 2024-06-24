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

import type {
  Attachment,
  AttachmentsService,
} from "@xwiki/cristal-attachments-api";
import { Ref } from "vue";
import { inject, injectable } from "inversify";
import { defineStore, Store, StoreDefinition, storeToRefs } from "pinia";
import { type CristalApp } from "@xwiki/cristal-api";

type Id = "attachments";
type State = {
  attachments: Attachment[];
  isLoading: boolean;
  isUploading: false;
  unknownPage: boolean;
  error: string | undefined;
};
/**
 * Take a given type "Type" and wraps each of its fields in a readonly Ref.
 */
type WrappedRefs<Type> = {
  readonly [Property in keyof Type]: Ref<Type[Property]>;
};
type StateRefs = WrappedRefs<State>;
type Getters = Record<string, never>;
type Actions = {
  setLoading(): void;
  updateAttachments(attachments: Attachment[] | undefined): void;
  setError(error: string): void;
  startUploading(): void;
  stopUploading(): void;
};
type AttachmentsStoreDefinition = StoreDefinition<Id, State, Getters, Actions>;
type AttachmentsStore = Store<Id, State, Getters, Actions>;

const attachmentsStore: AttachmentsStoreDefinition = defineStore(
  "attachments",
  {
    state() {
      return {
        attachments: [],
        isLoading: true,
        isUploading: false,
        error: undefined,
        unknownPage: false,
      };
    },
    actions: {
      setLoading() {
        this.isLoading = true;
      },
      updateAttachments(attachments) {
        this.isLoading = false;
        this.error = undefined;
        if (attachments) {
          this.unknownPage = false;
          this.attachments = attachments;
        } else {
          this.unknownPage = true;
          this.attachments = [];
        }
      },
      setError(error: string) {
        this.isLoading = false;
        this.error = error;
      },
      startUploading() {
        this.isUploading = true;
      },
      stopUploading() {
        this.isUploading = false;
      },
    },
  },
);

/**
 * @since 0.9
 */
@injectable()
export class DefaultAttachmentsService implements AttachmentsService {
  private readonly refs: StateRefs;
  private readonly store: AttachmentsStore;

  constructor(
    @inject<CristalApp>("CristalApp") private readonly cristalApp: CristalApp,
  ) {
    // An internal store is kept to easily provide refs for updatable elements.
    this.store = attachmentsStore();
    this.refs = storeToRefs(this.store);
  }

  list(): StateRefs["attachments"] {
    return this.refs.attachments;
  }

  isLoading(): StateRefs["isLoading"] {
    return this.refs.isLoading;
  }

  isUploading(): StateRefs["isUploading"] {
    return this.refs.isUploading;
  }

  getError(): StateRefs["error"] {
    return this.refs.error;
  }

  async refresh(page: string): Promise<void> {
    this.store.setLoading();
    try {
      const attachments = await this.getStorage().getAttachments(page);
      this.store.updateAttachments(
        attachments?.map(({ id, reference, mimetype, href }) => {
          return { id, name: reference, mimetype, href };
        }),
      );
    } catch (e) {
      this.store.setError(e.message);
    }
  }

  private getStorage() {
    return this.cristalApp.getWikiConfig().storage;
  }

  async upload(page: string, files: File[]): Promise<void> {
    this.store.startUploading();
    try {
      await this.getStorage().saveAttachments(page, files);
    } finally {
      this.store.stopUploading();
    }

    await this.refresh(page);
    return;
  }
}
