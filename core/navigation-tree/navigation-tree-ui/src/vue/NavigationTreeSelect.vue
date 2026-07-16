<!--
  See the LICENSE file distributed with this work for additional
  information regarding copyright ownership.

  This is free software; you can redistribute it and/or modify it
  under the terms of the GNU Lesser General Public License as
  published by the Free Software Foundation; either version 2.1 of
  the License, or (at your option) any later version.

  This software is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public
  License along with this software; if not, write to the Free
  Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA, or see the FSF site: http://www.fsf.org.
-->
<script setup lang="ts">
import NavigationTree from "./NavigationTree.vue";
import messages from "../translations";
import { SpaceReference } from "@xwiki/platform-model-api";
import { computed, inject, onBeforeMount, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { CristalApp } from "@xwiki/platform-api";
import type { DocumentService } from "@xwiki/platform-document-api";
import type { DisplayableTreeNode } from "@xwiki/platform-dsapi";
import type {
  PageHierarchyItem,
  PageHierarchyResolver,
  PageHierarchyResolverProvider,
} from "@xwiki/platform-hierarchy-api";
import type { DocumentReference } from "@xwiki/platform-model-api";
import type {
  ModelReferenceHandler,
  ModelReferenceHandlerProvider,
} from "@xwiki/platform-model-reference-api";
import type { Ref } from "vue";

type NavigationTreeNode = DisplayableTreeNode & {
  location: SpaceReference;
};

defineProps<{
  label: string;
  help?: string;
  includeTerminals?: boolean;
}>();
const model = defineModel<SpaceReference>();

const cristal: CristalApp = inject<CristalApp>("cristal")!;
const hierarchyResolver: PageHierarchyResolver = cristal
  .getContainer()
  .get<PageHierarchyResolverProvider>("PageHierarchyResolverProvider")
  .get()!;
const referenceHandler: ModelReferenceHandler = cristal
  .getContainer()
  .get<ModelReferenceHandlerProvider>("ModelReferenceHandlerProvider")
  .get()!;
const documentService: DocumentService = cristal
  .getContainer()
  .get<DocumentService>("DocumentService");
const currentPageReference: Ref<DocumentReference | undefined> =
  documentService.getCurrentDocumentReference();

const openedLocationDialog: Ref<boolean> = ref(false);
const hierarchy: Ref<Array<PageHierarchyItem>> = ref([]);
// The location chosen in the tree, only applied to the model once the user
// confirms with the Select button.
const pendingLocation: Ref<SpaceReference | undefined> = ref(undefined);

const changeLocationButtonId = useId();
const selectButtonId = useId();

const { t } = useI18n({
  messages,
});

watch(model, async (newLocation) => {
  if (newLocation && newLocation.names.length > 0) {
    const selectedPage = referenceHandler.createDocumentReference(
      newLocation.names[newLocation.names.length - 1],
      new SpaceReference(newLocation.wiki, ...newLocation.names.slice(0, -1)),
    );
    hierarchy.value = await hierarchyResolver.getPageHierarchy(
      selectedPage,
      false,
    );
  } else {
    hierarchy.value = [
      { label: t("navigation.tree.root.node.label"), pageId: "", url: "." },
    ];
  }
});

onBeforeMount(async () => {
  // A location provided by the caller takes precedence over the default
  // (the space of the current page).
  const initialLocation = model.value ?? currentPageReference.value!.space;
  model.value = initialLocation;
  if (initialLocation) {
    hierarchy.value = await hierarchyResolver.getPageHierarchy(
      initialLocation,
      false,
    );
  }
});

async function nodeClickAction(node: NavigationTreeNode) {
  pendingLocation.value = node.location;
}

function selectLocation() {
  if (pendingLocation.value) {
    model.value = pendingLocation.value;
  }
  openedLocationDialog.value = false;
}

// Start each visit to the location dialog from a clean slate so a choice
// abandoned by closing the dialog is not applied on the next confirmation.
watch(openedLocationDialog, (opened) => {
  if (opened) {
    pendingLocation.value = undefined;
  }
});

// The breadcrumb is a plain display of the selected location: the urls are
// stripped so that its segments are not rendered as links, otherwise clicking
// one would navigate away while the surrounding dialog stays open.
const displayHierarchy = computed(() =>
  hierarchy.value.map(({ label }) => ({ label })),
);
</script>

<template>
  <x-text-field :label="label" :help="help" modelValue=" " readonly>
    <template #default>
      <XBreadcrumb :items="displayHierarchy"></XBreadcrumb>
    </template>
  </x-text-field>
  <XDialog
    v-model="openedLocationDialog"
    width="auto"
    :title="t('navigation.tree.select.location.label')"
  >
    <template #activator>
      <x-btn :id="changeLocationButtonId" size="small" color="secondary">
        {{ t("navigation.tree.select.location.label") }}
      </x-btn>
    </template>
    <template #default>
      <navigation-tree
        :include-terminals="includeTerminals"
        :node-click-action="nodeClickAction"
        show-root-node
      ></navigation-tree>
    </template>
    <template #footer>
      <XBtn :id="selectButtonId" variant="primary" @click="selectLocation">
        {{ t("navigation.tree.select.location.select") }}
      </XBtn>
    </template>
  </XDialog>
</template>
