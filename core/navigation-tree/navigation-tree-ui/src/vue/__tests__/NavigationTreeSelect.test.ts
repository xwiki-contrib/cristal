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

import NavigationTreeSelect from "../NavigationTreeSelect.vue";
import { flushPromises, mount } from "@vue/test-utils";
import { mockI18n } from "@xwiki/cristal-dev-test-utils";
import { DocumentReference, SpaceReference } from "@xwiki/platform-model-api";
import { Container } from "inversify";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { ref } from "vue";
import type { DocumentService } from "@xwiki/platform-document-api";
import type {
  PageHierarchyResolver,
  PageHierarchyResolverProvider,
} from "@xwiki/platform-hierarchy-api";
import type {
  ModelReferenceHandler,
  ModelReferenceHandlerProvider,
} from "@xwiki/platform-model-reference-api";

vi.mock("vue-i18n");

const XBreadcrumbStub = {
  props: {
    items: Array,
  },
  template: `<span
    v-for="item in items"
    class="breadcrumb-segment"
    :data-url="item.url"
    >{{ item.label }}</span>`,
};

const NavigationTreeStub = {
  props: ["nodeClickAction", "includeTerminals", "showRootNode"],
  template: `<div class="navigation-tree-stub"></div>`,
};

const XTextFieldStub = {
  props: {
    label: String,
    help: String,
    modelValue: String,
    readonly: Boolean,
  },
  template: `<div>
    <span class="label">{{ label }}</span>
    <input :value="modelValue" :readonly="readonly" />
    <slot></slot>
    <span class="help">{{ help }}</span>
  </div>`,
};

// The successive references for which a page hierarchy was requested, reset
// on each mount.
let hierarchyRequests: unknown[] = [];

// eslint-disable-next-line max-statements
function mountNavigationTreeSelect(options?: { location?: SpaceReference }) {
  const containerMock = mock<Container>();

  hierarchyRequests = [];
  const mockHierarchyResolver = mock<PageHierarchyResolver>();
  mockHierarchyResolver.getPageHierarchy.mockImplementation(async (page) => {
    hierarchyRequests.push(page);
    return [
      { label: "Home", pageId: "Home", url: "/Home" },
      { label: "Deep Space", pageId: "Home.Deep", url: "/Home/Deep" },
    ];
  });
  const mockHierarchyResolverProvider = mock<PageHierarchyResolverProvider>();
  mockHierarchyResolverProvider.get.mockReturnValue(mockHierarchyResolver);

  const mockReferenceHandler = mock<ModelReferenceHandler>();
  mockReferenceHandler.createDocumentReference.mockImplementation(
    (name, space) => new DocumentReference(name, space),
  );
  const mockReferenceHandlerProvider = mock<ModelReferenceHandlerProvider>();
  mockReferenceHandlerProvider.get.mockReturnValue(mockReferenceHandler);

  const mockDocumentService = mock<DocumentService>();
  mockDocumentService.getCurrentDocumentReference.mockReturnValue(
    ref(
      new DocumentReference(
        "WebHome",
        new SpaceReference(undefined, "Home", "Deep Space"),
      ),
    ),
  );

  containerMock.get
    .calledWith("PageHierarchyResolverProvider")
    .mockReturnValue(mockHierarchyResolverProvider);
  containerMock.get
    .calledWith("ModelReferenceHandlerProvider")
    .mockReturnValue(mockReferenceHandlerProvider);
  containerMock.get
    .calledWith("DocumentService")
    .mockReturnValue(mockDocumentService);

  mockI18n();

  return mount(NavigationTreeSelect, {
    props: {
      label: "Location Label",
      help: "Location Help",
      modelValue: options?.location,
    },
    global: {
      provide: {
        cristal: {
          getContainer() {
            return containerMock;
          },
        },
      },
      stubs: {
        NavigationTree: NavigationTreeStub,
        XBreadcrumb: XBreadcrumbStub,
        XTextField: XTextFieldStub,
        XDialog: {
          template: `<div><slot name="activator"></slot><slot></slot><slot name="footer"></slot></div>`,
        },
        XBtn: {
          template: `<button><slot></slot></button>`,
        },
      },
    },
  });
}

// The model is a defineModel, so its committed value is observed through the
// emitted update:modelValue events rather than the (never re-bound) prop.
function committedLocation(
  wrapper: ReturnType<typeof mountNavigationTreeSelect>,
) {
  const events = wrapper.emitted("update:modelValue");
  return events ? events[events.length - 1][0] : undefined;
}

async function clickSelect(
  wrapper: ReturnType<typeof mountNavigationTreeSelect>,
) {
  // The button carries a generated id (useId), so it is located by its label.
  const selectButton = wrapper
    .findAll("button")
    .find(
      (button) => button.text() === "navigation.tree.select.location.select",
    )!;
  await selectButton.trigger("click");
  await flushPromises();
}

describe("NavigationTreeSelect", () => {
  it("displays the location in a readonly design system text field", async () => {
    const navigationTreeSelect = mountNavigationTreeSelect();
    await flushPromises();

    // The location is displayed through the design system text field, in
    // readonly mode since it can only be changed through the tree dialog.
    const textField = navigationTreeSelect.findComponent(XTextFieldStub);
    expect(textField.props("readonly")).toBe(true);
    expect(navigationTreeSelect.text()).toContain("Location Label");
    expect(navigationTreeSelect.text()).toContain("Location Help");
  });

  it("displays the hierarchy as non-navigable breadcrumb segments", async () => {
    const navigationTreeSelect = mountNavigationTreeSelect();
    await flushPromises();

    const segments = navigationTreeSelect.findAll(".breadcrumb-segment");
    expect(segments.map((segment) => segment.text())).toEqual([
      "Home",
      "Deep Space",
    ]);
    // Segments must not link anywhere: navigating would leave the dialog
    // open on a different page.
    for (const segment of segments) {
      expect(segment.attributes("data-url")).toBeUndefined();
    }
  });

  it("displays a location provided by the caller instead of the current page space", async () => {
    const provided = new SpaceReference(undefined, "Provided", "Location");
    const navigationTreeSelect = mountNavigationTreeSelect({
      location: provided,
    });
    await flushPromises();

    // The hierarchy displayed is the one of the provided location, and the
    // provided location is not overwritten with the current page space.
    expect(hierarchyRequests[0]).toStrictEqual(provided);
    expect(navigationTreeSelect.emitted("update:modelValue")).toBeUndefined();
  });

  it("only commits the chosen location once Select is clicked", async () => {
    const navigationTreeSelect = mountNavigationTreeSelect();
    await flushPromises();

    const chosen = new SpaceReference(undefined, "Sandbox");
    const tree = navigationTreeSelect.findComponent(NavigationTreeStub);

    // Clicking a node in the tree only stages the choice, it does not update
    // the model yet.
    await tree.props("nodeClickAction")({ location: chosen });
    await flushPromises();
    expect(committedLocation(navigationTreeSelect)).not.toBe(chosen);

    // The model is updated only when the Select button is clicked.
    await clickSelect(navigationTreeSelect);
    expect(committedLocation(navigationTreeSelect)).toStrictEqual(chosen);
  });

  it("commits the last staged choice when several nodes are clicked", async () => {
    const navigationTreeSelect = mountNavigationTreeSelect();
    await flushPromises();

    const tree = navigationTreeSelect.findComponent(NavigationTreeStub);
    await tree.props("nodeClickAction")({
      location: new SpaceReference(undefined, "Sandbox"),
    });
    const last = new SpaceReference(undefined, "XWiki");
    await tree.props("nodeClickAction")({ location: last });
    await flushPromises();

    await clickSelect(navigationTreeSelect);
    expect(committedLocation(navigationTreeSelect)).toStrictEqual(last);
  });

  it("does not commit anything when Select is clicked without a choice", async () => {
    const navigationTreeSelect = mountNavigationTreeSelect();
    await flushPromises();

    const before = navigationTreeSelect.emitted("update:modelValue")?.length;
    await clickSelect(navigationTreeSelect);
    expect(navigationTreeSelect.emitted("update:modelValue")?.length).toBe(
      before,
    );
  });
});
