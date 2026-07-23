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
import cRealtimeUsers from "./c-realtime-users.vue";
import cSaveStatus, { SaveStatus } from "./c-save-status.vue";
import messages from "../translations";
import { BlockNoteToUniAstConverter } from "../uniast/bn-to-uniast";
import { UniAstToBlockNoteConverter } from "../uniast/uniast-to-bn";
import { CArticle } from "@xwiki/cristal-skin";
import { collaborationManagerProviderName } from "@xwiki/platform-collaboration-api";
import { name as documentServiceName } from "@xwiki/platform-document-api";
import { BlocknoteEditor as CBlockNoteView } from "@xwiki/platform-editors-blocknote-headless";
import { macrosServiceName } from "@xwiki/platform-macros-service";
import { SYNTAX_CONFIG_COMPONENT_GROUP_NAME } from "@xwiki/platform-syntaxes-config";
import {
  markdownToUniAstConverterName,
  uniAstToMarkdownConverterName,
} from "@xwiki/platform-uniast-markdown";
import { debounce } from "lodash-es";
import {
  inject,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import type { AlertsService } from "@xwiki/cristal-alerts-api";
import type { CristalApp, PageData } from "@xwiki/platform-api";
import type { StorageProvider } from "@xwiki/platform-backend-api";
import type {
  Collaboration,
  CollaborationManager,
  CollaborationManagerProvider,
} from "@xwiki/platform-collaboration-api";
import type { DocumentService } from "@xwiki/platform-document-api";
import type { ContextForMacros } from "@xwiki/platform-editors-blocknote-headless";
import type { BlockType } from "@xwiki/platform-editors-blocknote-react";
import type { MacrosService } from "@xwiki/platform-macros-service";
import type { ModelReferenceHandlerProvider } from "@xwiki/platform-model-reference-api";
import type { SyntaxConfig } from "@xwiki/platform-syntaxes-config";
import type {
  MarkdownToUniAstConverter,
  UniAstToMarkdownConverter,
} from "@xwiki/platform-uniast-markdown";
import type { Ref } from "vue";

const { t } = useI18n({
  messages,
});

const cristal = inject<CristalApp>("cristal")!;
const container = cristal.getContainer();
const documentService = container.get<DocumentService>(documentServiceName);
const loading = documentService.isLoading();
const error = documentService.getError();
const unknownSyntax = ref<string | null>();
const currentPage = documentService.getCurrentDocument();
const currentPageName = documentService.getCurrentDocumentReferenceString();
const currentPageReference = documentService.getCurrentDocumentReference();
const modelReferenceHandler = container
  .get<ModelReferenceHandlerProvider>("ModelReferenceHandlerProvider")
  .get();
const alertsService = container.get<AlertsService>("AlertsService")!;
const storage = container.get<StorageProvider>("StorageProvider").get();

const collaboration: Ref<Collaboration | undefined> = ref(undefined);
let collaborationManager: CollaborationManager | undefined = undefined;
async function joinCollaborationSession(): Promise<void> {
  try {
    collaborationManager = container
      .get<CollaborationManagerProvider>(collaborationManagerProviderName)
      .get();
    // Try to join the realtime collaboration session for the current document.
    collaboration.value = await collaborationManager.join();
  } catch (e) {
    console.error("Failed to join the collaboration session: ", e);
    // Try again after a minute.
    setTimeout(() => {
      joinCollaborationSession();
    }, 60000);
  }
}
const { realtimeURL: realtimeServerURL } = cristal.getWikiConfig();
if (realtimeServerURL) {
  joinCollaborationSession();
}

const syntaxes: SyntaxConfig[] = container.getAll(
  SYNTAX_CONFIG_COMPONENT_GROUP_NAME,
);

if (realtimeServerURL) {
  joinCollaborationSession();
}

const title = ref("");
const titlePlaceholder = modelReferenceHandler?.getTitle(
  currentPageReference.value!,
);

const editorProps = shallowRef<
  InstanceType<typeof CBlockNoteView>["$props"]["editorProps"] | null
>(null);

const editorContent = shallowRef<BlockType[] | null>(null);

const editorInstance =
  useTemplateRef<InstanceType<typeof CBlockNoteView>>("editorInstance");

// Tools for UniAst handling
const markdownToUniAst = container.get<MarkdownToUniAstConverter>(
  markdownToUniAstConverterName,
);

const uniAstToMarkdown = container.get<UniAstToMarkdownConverter>(
  uniAstToMarkdownConverterName,
);

// Macros service
const macrosService = container.get<MacrosService>(macrosServiceName);

// Tools for the conversion between the UniAst and the BlockNote blocks handled
// by the editor.
const uniAstToBlockNote = new UniAstToBlockNoteConverter(container);
const blockNoteToUniAst = new BlockNoteToUniAstConverter(
  container,
  macrosService.list(),
);

// Saving status
const saveStatus = ref<SaveStatus>(SaveStatus.SAVED);

// Context for macros
const contextForMacros: ContextForMacros = {
  openParamsEditor(/*macro, params, update*/) {
    alert("TODO: params editor for macros in Cristal");
  },
};

/**
 * Setup the editor and title input using the fetched page's content
 *
 * @param currentPage - The fetched current page
 */
// eslint-disable-next-line max-statements
async function loadEditor(currentPage: PageData | undefined): Promise<void> {
  if (!currentPage) {
    // TODO
    return;
  }

  if (currentPage.syntax !== "markdown/1.2") {
    unknownSyntax.value = t("blocknote.syntax.editorUnsupported", {
      name: currentPage.syntax,
    });

    return;
  }

  const syntaxConfig = syntaxes.find(
    (syntax) => syntax.id === currentPage.syntax,
  );

  if (!syntaxConfig) {
    unknownSyntax.value = t("blocknote.syntax.backendUnsupported", {
      name: currentPage.syntax,
    });

    return;
  }

  editorProps.value = {
    theme: "light",
    // TODO: make this customizable
    // https://jira.xwiki.org/browse/CRISTAL-457
    lang: "en",
    label: t("blocknote.editor.label"),
    syntax: syntaxConfig,
  };

  const uniAst = await markdownToUniAst.parseMarkdown(currentPage.source);

  if (uniAst instanceof Error) {
    // TODO: error reporting
    console.error(uniAst);
    return;
  }

  const blocks = uniAstToBlockNote.uniAstToBlockNote(uniAst);

  if (blocks instanceof Error) {
    // TODO: error reporting
    console.error(blocks);
    return;
  }

  editorContent.value = blocks;

  title.value = documentService.getTitle().value ?? "";
}

/**
 * Go to the view route
 */
async function navigateToView() {
  // Notify that the document has been edited.
  if (currentPageReference.value) {
    await documentService.notifyDocumentChange(
      "update",
      currentPageReference.value,
    );
  }

  // Navigate to view mode.
  const viewRouterParams = {
    name: "view",
    params: { page: currentPageName.value ?? "" },
  };

  cristal?.getRouter().push(viewRouterParams);
}

/**
 * Convert the editor's BlockNote content to the markdown persisted in storage.
 *
 * @param content - The editor's BlockNote content
 * @returns the markdown, or an Error if the conversion failed
 */
async function blocksToMarkdown(content: BlockType[]): Promise<string | Error> {
  const uniAst = blockNoteToUniAst.blocksToUniAst(content);

  if (uniAst instanceof Error) {
    return uniAst;
  }

  return uniAstToMarkdown.toMarkdown(uniAst);
}

/**
 * Save a content into the current page document
 *
 * @param content - The content to save
 */
async function save(content: BlockType[]) {
  saveStatus.value = SaveStatus.SAVING;

  try {
    const markdown = await blocksToMarkdown(content);

    if (markdown instanceof Error) {
      throw markdown;
    }

    // TODO: html does not make any sense here.
    await storage.save(
      currentPageName.value ?? "",
      title.value,
      markdown,
      "html",
    );

    saveStatus.value = SaveStatus.SAVED;
  } catch (e) {
    // lastSaveSucceeded = false;
    console.error(e);
    alertsService.error(t("blocknote.editor.save.error"));

    saveStatus.value = SaveStatus.UNSAVED;
  }
}

/**
 * Save the editor's content into the page
 */
async function saveContent() {
  const editor = editorInstance.value!;
  const content = editor.getContent();

  await save(content);
}

/**
 * Save the editor's content and navigate to the view page
 */
async function submit() {
  await saveContent();

  // TODO: hold back user in case of error
  await navigateToView();
}

// Wait for the page to be fetched before loading the editor
watch(
  loading,
  (loading) => {
    if (!loading) {
      loadEditor(currentPage.value);
    }
  },
  { immediate: true },
);

/**
 * Save the edited title in realtime
 */
watch(
  title,
  debounce(async () => {
    if (editorInstance.value) {
      await saveContent();
    }
  }, 500),
);

function beforeUnload(evt: BeforeUnloadEvent): string | void {
  if (saveStatus.value !== SaveStatus.SAVED) {
    evt.preventDefault();

    // NOTE: the message won't actually be shown in most browsers nowadays, it will be replaced with a generic message instead.
    // This is not a bug.
    return t("blocknote.editor.save.unsavedChanges");
  }
}

onMounted(() => {
  window.addEventListener("beforeunload", beforeUnload);
});

onUnmounted(() => {
  collaborationManager?.leave();
  window.removeEventListener("beforeunload", beforeUnload);
});

onBeforeRouteLeave(() => {
  if (saveStatus.value !== SaveStatus.SAVED) {
    // NOTE: the message won't actually be shown in most browsers nowadays, it will be replaced with a generic message instead.
    // This is not a bug.
    return confirm(t("blocknote.editor.save.unsavedChanges"));
  }
});
</script>

<template>
  <c-article
    :loading
    :error
    :current-page
    :current-page-reference
    page-exist
    before-u-i-x-p-id="edit.before"
    after-u-i-x-p-id="edit.after"
  >
    <template #title>
      <input
        v-model="title"
        type="text"
        :placeholder="titlePlaceholder"
        class="doc-title"
      />
    </template>

    <template #default>
      <div class="doc-content">
        <span v-if="unknownSyntax">{{ unknownSyntax }}</span>

        <span v-else-if="!editorProps || !editorContent">Loading...</span>

        <template v-else>
          <div class="editor-centerer">
            <div class="editor">
              <CBlockNoteView
                ref="editorInstance"
                :editor-props
                :editor-content
                :deps-container="container"
                :collaboration
                :macros="{
                  ctx: contextForMacros,
                  list: macrosService.list(),
                }"
                @instant-change="saveStatus = SaveStatus.UNSAVED"
                @debounced-change="save"
              />
            </div>
          </div>

          <form class="pagemenu" @submit="submit">
            <div class="pagemenu-status">
              <c-realtime-users v-if="collaboration" :collaboration />
              <c-save-status :save-status />
            </div>

            <div class="pagemenu-actions">
              <x-btn size="small" variant="primary" @click="submit">
                Close
              </x-btn>
            </div>
          </form>
        </template>
      </div>
    </template>
  </c-article>
</template>

<style scoped>
.pagemenu {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-flow: row;
  gap: var(--cr-spacing-x-small);
  padding: var(--cr-spacing-x-small) var(--cr-spacing-x-small);
  background: var(--cr-color-neutral-100);
  width: var(--cr-spacing-max-page);
  margin: var(--cr-spacing-x-small) auto;
  border-radius: var(--cr-input-border-radius-medium);
  max-width: var(--cr-sizes-max-page-width);
  width: 100%;
}

.pagemenu-status {
  /* The content of this section may be a mix of inline and block level elements. */
  display: flex;
  /* Push the actions to the right end of the menu. */
  flex-grow: 1;
}

.pagemenu-status > * {
  /* Match the action button padding, which seems to be hard-coded.  */
  padding: 0 12px;
}

.editor-centerer {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.editor {
  outline: none;
  max-width: var(--cr-sizes-max-page-width);
  width: 100%;
}
</style>
