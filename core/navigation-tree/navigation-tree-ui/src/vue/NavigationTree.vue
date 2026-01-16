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
import messages from "../translations";
import { SpaceReference } from "@xwiki/platform-model-api";
import AsyncLock from "async-lock";
import { inject, onBeforeMount, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { CristalApp } from "@xwiki/platform-api";
import type { DocumentService } from "@xwiki/platform-document-api";
import type { DisplayableTreeNode } from "@xwiki/platform-dsapi";
import type { DocumentReference } from "@xwiki/platform-model-api";
import type {
  NavigationTreeSource,
  NavigationTreeSourceProvider,
} from "@xwiki/platform-navigation-tree-api";
import type { Ref } from "vue";

type NavigationTreeNode = DisplayableTreeNode & {
  location: SpaceReference;
};

const props = defineProps<{
  includeTerminals?: boolean;
  showRootNode?: boolean;
  nodeClickAction?: (node: NavigationTreeNode) => Promise<void>;
}>();

const cristal: CristalApp = inject<CristalApp>("cristal")!;
const treeSource: NavigationTreeSource = cristal
  .getContainer()
  .get<NavigationTreeSourceProvider>("NavigationTreeSourceProvider")
  .get();
const documentService: DocumentService = cristal
  .getContainer()
  .get<DocumentService>("DocumentService");
const currentPageReference: Ref<DocumentReference | undefined> =
  documentService.getCurrentDocumentReference();

// We need the root node of the tree to have a non-empty id
// (mainly for Vuetify's tree implementation). We use "_root" here, since the
// "_" prefix separates it from an actual id coming from the backend.
// This id will also be used for checks when the prop "showRootNode" is true.
const rootNodeId: string = "_root";

const activatedNode: Ref<string | undefined> = ref(undefined);
const openedNodes: Ref<string[]> = ref(props.showRootNode ? [rootNodeId] : []);

const { t } = useI18n({
  messages,
});

const treeNodeRoot: Ref<NavigationTreeNode> = ref({
  id: rootNodeId,
  label: t("navigation.tree.root.node.label"),
  location: new SpaceReference(),
  url: ".",
  children: [],
  activatable: props.showRootNode,
});

// We keep a map of id -> nodes associations to handle updates.
const nodesMap: Map<
  string,
  { node: NavigationTreeNode; parent?: NavigationTreeNode }
> = new Map();

var initDone: boolean = false;

// The fact that we can force a tree expansion while the user interacts with
// the tree could lead to nodes being loaded multiple times, in the event of a
// slow connection to the backend. As such, we rely on an asynchronous lock
// when loading nodes lazily.
const nodeLock: AsyncLock = new AsyncLock();

onBeforeMount(async () => {
  for (const node of await getChildNodes("")) {
    const newNode: NavigationTreeNode = {
      id: node.id,
      label: node.label,
      location: node.location,
      url: node.url,
      children: node.has_children ? [] : undefined,
      activatable: true,
    };
    nodesMap.set(node.id, {
      node: reactive(newNode),
      parent: reactive(treeNodeRoot.value),
    });
    treeNodeRoot.value.children?.push(newNode);
  }
  nodesMap.set(treeNodeRoot.value.id, {
    node: reactive(treeNodeRoot.value),
    parent: undefined,
  });

  // We can't rely on the watch to trigger the first expandTree, because it
  // might trigger before this callback has finished. As such, we do the first
  // one manually and then set a boolean to enable the watch.
  await expandTree(currentPageReference.value);
  documentService.registerDocumentChangeListener("delete", onDocumentDelete);
  documentService.registerDocumentChangeListener("update", onDocumentUpdate);
  initDone = true;
});

watch(currentPageReference, async (newReference) => {
  if (initDone) {
    await expandTree(newReference);
  }
});

// eslint-disable-next-line max-statements
async function expandTree(newReference: DocumentReference | undefined) {
  if (newReference) {
    const nodesToExpand = treeSource.getParentNodesId(
      newReference,
      props.includeTerminals,
    );

    const nodeToActivate = nodesToExpand.pop()!;

    activatedNode.value = nodeToActivate;
    openedNodes.value.push(...nodesToExpand);

    // We need to manually load children for nodes that have not yet been
    // opened.
    for (const nodeToExpand of nodesToExpand) {
      const currentNode = nodesMap.get(nodeToExpand);
      if (currentNode && currentNode.node.children?.length == 0) {
        await lazyLoadChildren(currentNode.node);
      }
    }

    // If there is a click action, we execute it manually on page change.
    if (props.nodeClickAction && nodesMap.has(nodeToActivate)) {
      await props.nodeClickAction(nodesMap.get(nodeToActivate)!.node);
    }

    // We do this operation to ensure there are no duplicates in the array.
    openedNodes.value = [...new Set(openedNodes.value)];
  }
}

async function lazyLoadChildren(node: NavigationTreeNode) {
  // We set an asynchronous lock on the current node's id.
  await nodeLock.acquire(node.id, async (done) => {
    if (node.children?.length == 0) {
      const childNodes = await getChildNodes(node.id);
      for (const child of childNodes) {
        const newNode = {
          id: child.id,
          label: child.label,
          location: child.location,
          url: child.url,
          children: child.has_children ? [] : undefined,
          activatable: props.nodeClickAction !== undefined,
        };
        nodesMap.set(child.id, {
          node: reactive(newNode),
          parent: reactive(node),
        });
        node.children?.push(newNode);
      }

      // If the node doesn't have any children, we update it.
      if (childNodes.length == 0) {
        node.children = undefined;
      }
    }

    // We release the lock.
    done();
  });
}

async function onDocumentDelete(page: DocumentReference) {
  const parents = treeSource.getParentNodesId(page, props.includeTerminals);
  const nodeId = parents.pop()!;

  // We only need to delete the node if it has been loaded.
  if (nodesMap.has(nodeId)) {
    const currentNode = nodesMap.get(nodeId)!;
    const parentNode = currentNode.parent!;
    // We set an asynchronous lock on the parent node's id.
    await nodeLock.acquire(parentNode.id, async (done) => {
      for (const i of parentNode.children!.keys()) {
        if (parentNode.children![i].id == nodeId) {
          // We only delete the node if it no longer has children.
          if ((await getChildNodes(nodeId)).length == 0) {
            parentNode.children!.splice(i, 1);
            nodesMap.delete(nodeId);
          }

          if (parentNode.children!.length == 0) {
            // If the parent node doesn't have any children anymore,
            // we update it.
            if (parentNode.children!.length == 0) {
              parentNode.children = undefined;
            }
          }
        }
      }

      // We release the lock.
      done();
    });
  }
}

async function onDocumentUpdate(page: DocumentReference) {
  const parents = treeSource.getParentNodesId(
    page,
    props.includeTerminals,
    true,
  );
  const nodeId = parents.pop()!;
  const parentId = parents.pop()!;

  // We set an asynchronous lock on the parent node's id.
  await nodeLock.acquire(parentId, async (done) => {
    // We only need to edit the node if it has been loaded,
    // or create it if it's new and its parent is open.
    if (nodesMap.has(nodeId)) {
      await onDocumentUpdateEditNode(nodeId);
    } else if (
      parentId == "" ||
      (nodesMap.has(parentId) && openedNodes.value.includes(parentId))
    ) {
      await onDocumentUpdateCreateNode(nodeId, parentId);
    }

    // We release the lock.
    done();
  });
}

async function onDocumentUpdateEditNode(nodeId: string) {
  const currentNode = nodesMap.get(nodeId)!;
  const parentNodeId =
    currentNode.parent!.id == rootNodeId ? "" : currentNode.parent!.id;
  // We re-fetch the parent node's children.
  for (const newNode of await getChildNodes(parentNodeId)) {
    if (newNode.id == nodeId) {
      currentNode.node.label = newNode.label;
      currentNode.node.url = newNode.url;
      break;
    }
  }
}

async function onDocumentUpdateCreateNode(nodeId: string, parentId: string) {
  const parentNode = nodesMap.get(parentId == "" ? rootNodeId : parentId)!;
  // We re-fetch the parent node's children.
  for (const newNode of await getChildNodes(parentId)) {
    if (newNode.id == nodeId) {
      if (parentNode.node.children) {
        parentNode.node.children.push(newNode);
      } else {
        parentNode.node.children = [newNode];
      }
      nodesMap.set(nodeId, {
        node: reactive(newNode),
        parent: reactive(parentNode.node),
      });
      break;
    }
  }
}

async function getChildNodes(id: string) {
  return (await treeSource.getChildNodes(id)).filter(
    (c) => props.includeTerminals || !c.is_terminal,
  );
}
</script>

<template>
  <XTree
    :rootNode="treeNodeRoot"
    :lazy-load-children="lazyLoadChildren"
    :node-click-action="nodeClickAction"
    :show-root-node="showRootNode"
    v-model:activated="activatedNode"
    v-model:opened="openedNodes"
  ></XTree>
</template>
