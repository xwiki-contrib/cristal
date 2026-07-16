/**
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

import "reflect-metadata";
import CPageCreationMenu from "../c-page-creation-menu.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { mockI18n } from "@xwiki/cristal-dev-test-utils";
import { DocumentReference, SpaceReference } from "@xwiki/platform-model-api";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { ref } from "vue";
import type { StorageProvider } from "@xwiki/cristal-backend-api";
import type { WikiConfig } from "@xwiki/platform-api";
import type { DocumentService } from "@xwiki/platform-document-api";
import type {
  ModelReferenceHandler,
  ModelReferenceHandlerProvider,
  ModelReferenceSerializer,
  ModelReferenceSerializerProvider,
} from "@xwiki/platform-model-reference-api";
import type { Container } from "inversify";

vi.mock("vue-i18n");

const NavigationTreeSelectStub = {
  props: ["modelValue", "label", "help"],
  template: `<div class="navigation-tree-select-stub"></div>`,
};

// eslint-disable-next-line max-statements
function mountPageCreationMenu(options: {
  currentPageReference: DocumentReference;
  createDocumentReference: (
    name: string,
    space: SpaceReference,
  ) => DocumentReference;
}) {
  const container = mock<Container>();

  const mockDocumentService = mock<DocumentService>({
    getCurrentDocumentReference() {
      return ref(options.currentPageReference);
    },
  });
  const mockModelReferenceHandler = mock<ModelReferenceHandler>();
  mockModelReferenceHandler.createDocumentReference.mockImplementation(
    options.createDocumentReference,
  );
  const mockModelReferenceHandlerProvider =
    mock<ModelReferenceHandlerProvider>();
  mockModelReferenceHandlerProvider.get.mockReturnValue(
    mockModelReferenceHandler,
  );
  const mockModelReferenceSerializerProvider =
    mock<ModelReferenceSerializerProvider>();
  mockModelReferenceSerializerProvider.get.mockReturnValue(
    mock<ModelReferenceSerializer>(),
  );
  const mockStorageProvider = mock<StorageProvider>();

  container.get
    .calledWith("DocumentService")
    .mockReturnValue(mockDocumentService);
  container.get
    .calledWith("ModelReferenceHandlerProvider")
    .mockReturnValue(mockModelReferenceHandlerProvider);
  container.get
    .calledWith("ModelReferenceSerializerProvider")
    .mockReturnValue(mockModelReferenceSerializerProvider);
  container.get
    .calledWith("StorageProvider")
    .mockReturnValue(mockStorageProvider);

  mockI18n();

  return mount(CPageCreationMenu, {
    props: {
      currentPageReference: options.currentPageReference,
    },
    global: {
      provide: {
        cristal: {
          getContainer() {
            return container;
          },
          getWikiConfig() {
            return mock<WikiConfig>({
              getNewPageDefaultName() {
                return "NewPage";
              },
            });
          },
        },
      },
      stubs: {
        NavigationTreeSelect: NavigationTreeSelectStub,
        CIcon: true,
        XDialog: {
          template: `<div><slot name="activator" :activatorProps="{}"></slot><slot></slot><slot name="footer"></slot></div>`,
        },
        XBtn: {
          template: `<button><slot></slot></button>`,
        },
        XForm: {
          template: `<form><slot></slot></form>`,
        },
        XTextField: {
          template: `<div></div>`,
        },
        XAlert: {
          template: `<div><slot></slot></div>`,
        },
      },
    },
  });
}

async function openDialog(wrapper: ReturnType<typeof mountPageCreationMenu>) {
  await wrapper.find("#new-page-button").trigger("click");
  await flushPromises();
}

describe("c-page-creation-menu", () => {
  it("opens with the current page as parent location (path-based backend)", async () => {
    // Path-based backends (e.g. Nextcloud): the document name is a plain
    // path segment, re-creating a document from its own name and space
    // yields the same document.
    const menu = mountPageCreationMenu({
      currentPageReference: new DocumentReference(
        "subpage",
        new SpaceReference(undefined, "home"),
      ),
      createDocumentReference: (name, space) =>
        new DocumentReference(name, space),
    });
    await openDialog(menu);

    expect(
      menu.findComponent(NavigationTreeSelectStub).props("modelValue"),
    ).toStrictEqual(new SpaceReference(undefined, "home", "subpage"));
  });

  it("opens with the current page as parent location (XWiki-style backend)", async () => {
    // XWiki-style backends: the document name is a marker ("WebHome"), the
    // space of the document already designates the page.
    const menu = mountPageCreationMenu({
      currentPageReference: new DocumentReference(
        "WebHome",
        new SpaceReference(undefined, "Space", "Page"),
      ),
      createDocumentReference: (name, space) =>
        new DocumentReference(
          "WebHome",
          new SpaceReference(space.wiki, ...space.names, name),
        ),
    });
    await openDialog(menu);

    expect(
      menu.findComponent(NavigationTreeSelectStub).props("modelValue"),
    ).toStrictEqual(new SpaceReference(undefined, "Space", "Page"));
  });
});
