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
import { inject, onBeforeMount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type {
  PageHierarchyItem,
  PageHierarchyResolver,
  PageHierarchyResolverProvider,
} from "@xwiki/cristal-hierarchy-api";
import type { CristalApp } from "@xwiki/platform-api";
import type { DocumentService } from "@xwiki/platform-document-api";
import type { DisplayableTreeNode } from "@xwiki/platform-dsapi";
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
  const currentSpaceReference = currentPageReference.value!.space;
  model.value = currentSpaceReference;
  if (currentSpaceReference) {
    hierarchy.value = await hierarchyResolver.getPageHierarchy(
      currentPageReference.value!.space!,
      false,
    );
  }
});

async function nodeClickAction(node: NavigationTreeNode) {
  model.value = node.location;
}
</script>

<template>
  <x-text-field :label="label" :help="help" modelValue=" " readonly>
    <template #default>
      <XBreadcrumb :items="hierarchy"></XBreadcrumb>
    </template>
  </x-text-field>
  <XDialog
    v-model="openedLocationDialog"
    width="auto"
    :title="t('navigation.tree.select.location.label')"
  >
    <template #activator>
      <x-btn id="change-page-location-button" size="small" color="secondary">
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
      <XBtn variant="primary" @click="openedLocationDialog = false">
        {{ t("navigation.tree.select.location.select") }}
      </XBtn>
    </template>
  </XDialog>
</template>
