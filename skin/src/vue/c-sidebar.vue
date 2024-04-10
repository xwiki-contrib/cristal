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
import CConfigMenu from "./c-config-menu.vue";
import CSidebarPanel from "./c-sidebar-panel.vue";
import CHelp from "./c-help.vue";
import xlogo from "../images/xwiki-logo-color.svg";
import { CIcon } from "@cristal/icons";
const logo = xlogo;
</script>
<template>
  <div class="collapsed-sidebar">
    <c-icon name="list"></c-icon>
  </div>
  <x-navigation-drawer id="sidebar" class="left-sidebar">
    <UIX uixname="sidebar.before" />
    <div class="sidebar-header">
      <c-icon name="list"></c-icon>
      <x-img class="logo" :src="logo" />
      <c-icon name="bell"></c-icon>
      <c-config-menu></c-config-menu>
      <x-avatar class="avatar"></x-avatar>
    </div>
    <div class="search">
      <x-search></x-search>
    </div>
    <div class="panel-container">
      <!-- Navigation example, the sl-tree component should be generalized by a equivalent component in Cristal DS.
      Item 4 have many items to help test the overflowing characteristics of the sidebar. -->
      <c-sidebar-panel name="Wiki Name">
        <sl-tree class="tree-selectable">
          <sl-tree-item>
            Item 1
            <sl-tree-item>
              Item A
              <sl-tree-item>Item Z</sl-tree-item>
              <sl-tree-item>Item Y</sl-tree-item>
              <sl-tree-item>Item X</sl-tree-item>
            </sl-tree-item>
            <sl-tree-item>Item B</sl-tree-item>
            <sl-tree-item>Item C</sl-tree-item>
          </sl-tree-item>
          <sl-tree-item>Item 2</sl-tree-item>
          <sl-tree-item>Item 3</sl-tree-item>
          <sl-tree-item>
            Item 4
            <sl-tree-item>
              Item A
              <sl-tree-item>Item Z</sl-tree-item>
              <sl-tree-item>Item Y</sl-tree-item>
              <sl-tree-item>Item X</sl-tree-item>
              <sl-tree-item>Item Z</sl-tree-item>
              <sl-tree-item>Item Y</sl-tree-item>
              <sl-tree-item>Item X</sl-tree-item>
              <sl-tree-item>Item Z</sl-tree-item>
              <sl-tree-item>Item Y</sl-tree-item>
              <sl-tree-item>Item X</sl-tree-item>
              <sl-tree-item>Item Z</sl-tree-item>
              <sl-tree-item>Item Y</sl-tree-item>
              <sl-tree-item>Item X</sl-tree-item>
              <sl-tree-item>Item Z</sl-tree-item>
              <sl-tree-item>Item Y</sl-tree-item>
              <sl-tree-item>Item X</sl-tree-item>
              <sl-tree-item>Item Z</sl-tree-item>
              <sl-tree-item>Item Y</sl-tree-item>
              <sl-tree-item>Item X</sl-tree-item>
            </sl-tree-item>
            <sl-tree-item>Item B</sl-tree-item>
            <sl-tree-item>Item C</sl-tree-item>
          </sl-tree-item>
          <sl-tree-item>Item 5</sl-tree-item>
          <sl-tree-item>Item 6</sl-tree-item>
        </sl-tree>
      </c-sidebar-panel>
      <c-sidebar-panel name="Applications"></c-sidebar-panel>

      <!--    <CTemplate name="panel" panel-name="Help.TipsPanel.WebHome" />-->
      <!--    <CTemplate name="panel" panel-name="Panels.Applications" />-->
      <!--    <CTemplate name="panel" panel-name="Panels.Navigation" />-->
      <!--    <CTemplate name="panel" panel-name="Sandbox.TestPanel" />-->
      <UIX uixname="sidebar.after" />
    </div>
    <c-help></c-help>
  </x-navigation-drawer>
</template>
<style scoped>
.left-sidebar {
  grid-area: sidebar;
  display: flex;
  flex-flow: column;
  gap: var(--cr-spacing-medium);
  overflow: hidden;
  border-right: 1px solid var(--cr-color-neutral-200);
  box-shadow: var(--cr-shadow-large);
}
.panel-container {
  display: flex;
  flex-flow: column;
  height: 100%;
  gap: var(--cr-spacing-x-small);
  padding: 0 var(--cr-spacing-x-small);
  overflow: auto;
}
.search {
  padding: 0 var(--cr-spacing-x-small);
}
.sidebar-header {
  display: flex;
  flex-wrap: wrap;
  flex-flow: row;
  align-items: center;
  gap: var(--cr-spacing-x-small);
  padding: var(--cr-spacing-small) var(--cr-spacing-x-small) 0;
}
sl-avatar {
  --size: 2rem;
}
.logo {
  margin-right: auto;
}

.collapsed-sidebar {
  display: none;
  background: var(--cr-color-neutral-100);
  grid-area: collapsed-sidebar;
}

</style>
