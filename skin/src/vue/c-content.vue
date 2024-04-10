<!--
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 * This file is part of the Cristal Wiki software prototype
 * @copyright  Copyright (c) 2023 XWiki SAS
 * @license    http://opensource.org/licenses/AGPL-3.0 AGPL-3.0
 *
-->
<script lang="ts" setup>
import CTemplate from "./c-template.vue";
import { inject, onMounted, onUpdated, ref } from "vue";
import type { CristalApp, Logger } from "@cristal/api";
import { ContentTools } from "./contentTools";
import { CIcon } from "@cristal/icons";

const root = ref(null);
const content = ref(null);
const cristal = inject<CristalApp>("cristal");
const pageStatus = ref({
  currentContent: cristal?.getCurrentContent(),
  css: [],
  js: [],
  html: "",
  document: null,
  withSheet: false,
  sheet: "",
});
let logger: Logger | undefined = undefined;

if (cristal != null) {
  ContentTools.init(cristal);
  logger = cristal.getLogger("skin.vue.content");
  logger?.debug("cristal object content ref set");
  cristal.setContentRef(pageStatus);
  logger?.debug("Sheet is ", pageStatus.value.sheet);
  logger?.debug("With Sheet is ", pageStatus.value.withSheet);
} else {
  console.error("cristal object not injected properly in c-content.vue");
}

let serverSideRendering = cristal?.getWikiConfig().serverRendering;

onMounted(() => {
  const cristal = inject<CristalApp>("cristal");
  logger?.debug("in mounted");

  ContentTools.transformImages(cristal, "xwikicontent");
  // ContentTools.transformScripts(cristal);
});

const currentPage = cristal?.getCurrentPage() || "XWiki.Main";

onUpdated(() => {
  const cristal = inject<CristalApp>("cristal");
  logger?.debug("in updated");

  logger?.debug("Sheet is ", pageStatus.value.sheet);
  logger?.debug("With Sheet is ", pageStatus.value.withSheet);

  if (cristal && content.value != null) {
    ContentTools.listenToClicks(content.value, cristal);
    ContentTools.transformMacros(content.value, cristal);
  }
  ContentTools.loadCSS(pageStatus.value.css);
  ContentTools.loadJS(pageStatus.value.js);
});
</script>
<template>
  <article id="content" ref="root" class="content">
    <UIX uixname="content.before" />
    <!-- Provide a target for the links listener, otherwise the links from other
    elements of the component can be wrongly captured. -->
    <div ref="content" class="inner-content">
      <template v-if="pageStatus.withSheet && !serverSideRendering">
        <CTemplate
          :name="pageStatus.sheet"
          :document="pageStatus.document"
          mode="view"
        />
      </template>
      <template v-else>
        <!-- eslint-disable vue/no-v-html -->
        <div class="content-header">
          <XBreadcrumb class="breadcrumb"></XBreadcrumb>
          <x-btn circle size="small" variant="primary">
            <!--TODO: the sl-icon component doesn't seem to be working https://shoelace.style/components/button#circle-buttons-->
            <sl-icon name="plus" label="Create a new document"></sl-icon
          ></x-btn>
          <div class="pagemenu">
            <x-menu title="Edit">
              <template #activator="{ props }">
                <span v-bind="props"> Edit </span>
              </template>
              <template #default>
                <x-menu-item title="Default Editor">
                  <router-link
                    :to="{
                      name: 'edit',
                      params: { page: currentPage },
                    }"
                    >Default Editor
                  </router-link>
                </x-menu-item>
                <x-menu-item title="Text Editor">
                  <router-link
                    :to="{
                      name: 'edittext',
                      params: { page: currentPage },
                    }"
                    >Text Editor
                  </router-link>
                </x-menu-item>
                <x-menu-item title="XWiki Editor">
                  <router-link
                    :to="{
                      name: 'editxwiki',
                      params: { page: currentPage },
                    }"
                    >XWiki Editor
                  </router-link>
                </x-menu-item>
                <x-menu-item title="Milkdown Editor">
                  <router-link
                    :to="{
                      name: 'editmilkdown',
                      params: { page: currentPage },
                    }"
                    >Milkdown Editor
                  </router-link>
                </x-menu-item>
                <x-menu-item title="Prosemirror Editor">
                  <router-link
                    :to="{
                      name: 'editprosemirror',
                      params: { page: currentPage },
                    }"
                    >Prosemirror Editor
                  </router-link>
                </x-menu-item>
              </template>
            </x-menu>
          </div>
        </div>
        <div class="content-scroll">
          <div class="mock-content">
            <div class="doc-header">
              <h1 class="document-title">Document Title</h1>
              <div class="doc-info-header">
                <x-avatar class="avatar"></x-avatar>
                <span class="doc-info-user-info">
                  User Name edited on 12/12/2024 at 12:00
                </span>
                <div class="doc-info-actions">
                  <div class="info-action like">
                    <c-icon name="heart"></c-icon>
                    <span class="counter">99</span>
                  </div>
                  <div class="info-action comments">
                    <c-icon name="chat"></c-icon>
                    <span class="counter">99</span>
                  </div>
                  <div class="info-action attachments">
                    <c-icon name="paperclip"></c-icon>
                    <span class="counter">99</span>
                  </div>
                </div>
              </div>
              <div class="editor-toolbar">
                <c-icon name="arrow-counterclockwise"></c-icon>
                <c-icon name="arrow-clockwise"></c-icon>
                <c-icon name="type-bold"></c-icon>
                <c-icon name="type-italic"></c-icon>
                <c-icon name="type-strikethrough"></c-icon>
                <c-icon name="list-ul"></c-icon>
                <c-icon name="list-ol"></c-icon>
                <c-icon name="quote"></c-icon>
              </div>
            </div>
            <div class="document-content">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute in
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit, sed do eiusmod tempor incididunt
                ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                ea commodo consequat. Duis aute irure dolor in reprehenderit
                in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit, sed do eiusmod tempor incididunt
                ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                ea commodo consequat. Duis aute irure dolor in reprehenderit
                in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                irure dolor in reprehenderit in voluptate velit esse cillum
                dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit, sed do eiusmod tempor incididunt
                ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                ea commodo consequat. Duis aute irure dolor in reprehenderit
                in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt
                in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
            <div class="doc-info-footer">
              <x-avatar class="avatar"></x-avatar>
              <span class="doc-info-user-info">User name created...</span>
            </div>
          </div>
          <hr />
          <div id="xwikicontent" v-html="pageStatus.currentContent" />
        </div>
      </template>
    </div>
    <UIX uixname="content.after" />
  </article>
</template>
<style scoped>
.mock-content {
  display: flex;
  flex-flow: column;
  gap: var(--cr-spacing-medium);
}
.doc-header {
  display: flex;
  flex-flow: column;
  gap: var(--cr-spacing-x-small);
}

.document-title {
  margin: 0;
}

.counter {
  background-color: var(--cr-color-primary-600);
  font-weight: var(--cr-font-weight-semibold);
  font-size: var(--cr-font-size-x-small);
  line-height: var(--cr-font-size-2x-small);
  border-radius: 99px;
  color: #fff;
  flex-shrink: 1;
  flex-grow: 0;
  display: block;
  padding: var(--cr-spacing-2x-small) var(--cr-spacing-x-small);
}

.doc-info-actions {
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: var(--cr-spacing-2x-small);
}

.cr-icon {
  display: block;
  font-size: var(--cr-font-size-medium);
  flex-grow: 0;
  flex-shrink: 1;
  line-height: var(--cr-font-size-medium);
}

.info-action {
  display: flex;
  background-color: var(--cr-color-neutral-100);
  border-radius: 99px;
  padding: var(--cr-spacing-2x-small) var(--cr-spacing-x-small);
  font-size: var(--cr-font-size-medium);
  flex-flow: row;
  gap: var(--cr-spacing-2x-small);
  align-items: center;
}

.doc-info-header,
.doc-info-footer {
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--cr-spacing-small);
}

.doc-info-user-info {
  color: var(--cr-color-neutral-500);
  font-size: var(--cr-font-size-small);
  margin-right: auto;
}

sl-avatar {
  --size: 24px;
}

.editor-toolbar {
  border-radius: var(--cr-input-border-radius-large);
  background-color: var(--cr-color-neutral-100);
  padding: var(--cr-spacing-x-small) var(--cr-spacing-small);
  display: flex;
  gap: var(--cr-spacing-small);
  flex-wrap: wrap;
}

.editor-toolbar .cr-icon {
  font-size: var(--cr-font-size-large);
}

.content,
.content-scroll {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.content {
  display: flex;
  flex-flow: column;
  grid-area: content;
}

.content-scroll {
  display: flex;
  flex-flow: column;
  align-items: center;
  overflow: auto;
  height: 100%;
  padding: var(--cr-spacing-x-small);
}

.content-scroll > div {
  width: 100%;
  max-width: 960px; /*TODO: This value needs to be dynamic*/
}

.content-header {
  padding: var(--cr-spacing-x-small) var(--cr-spacing-medium);
  display: flex;
  flex-wrap: wrap;
  gap: var(--cr-spacing-medium);
  align-items: center;
  flex-flow: row;
}

.inner-content {
  display: flex;
  flex-flow: column;
  flex-basis: auto;
  overflow: auto;
}
</style>
