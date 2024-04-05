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
import xlogo from "../images/xwiki-logo-mono.svg";
import { CIcon } from "@cristal/icons";
const logo = xlogo;
</script>
<template>
  <x-navigation-drawer id="sidebar" class="left-sidebar">
    <UIX uixname="sidebar.before" />
    <div class="sidebar-header">
      <div class="left">
        <c-icon name="list"></c-icon>
        <x-img :src="logo" />
      </div>
      <div class="right">
        <c-icon name="bell"></c-icon>
        <c-config-menu></c-config-menu>
        <x-avatar class="avatar"></x-avatar>
      </div>
    </div>
    <div class="search">
      <x-search></x-search>
    </div>
    <div class="panel-container">
      <c-sidebar-panel></c-sidebar-panel>
      <c-sidebar-panel></c-sidebar-panel>
      <c-sidebar-panel></c-sidebar-panel>

      <!--    <CTemplate name="panel" panel-name="Help.TipsPanel.WebHome" />-->
      <!--    <CTemplate name="panel" panel-name="Panels.Applications" />-->
      <!--    <CTemplate name="panel" panel-name="Panels.Navigation" />-->
      <!--    <CTemplate name="panel" panel-name="Sandbox.TestPanel" />-->
      <UIX uixname="sidebar.after" />
    </div>
  </x-navigation-drawer>
</template>
<style scoped>
.left-sidebar {
  display: flex;
  flex-flow: column;
  gap: 16px;
  overflow: hidden;
}
.panel-container {
  display: flex;
  flex-flow: column;
  gap: 8px;
  padding: 8px;
  overflow: auto;
}
.search {
  padding: 0 8px;
}
.sidebar-header {
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 4px;
  padding: 8px;
}
sl-avatar {
  --size: 2rem;
}
.right {
  margin-left: auto;
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 4px;
}
.left {
  margin-right: auto;
  display: flex;
  flex-flow: row;
  gap: 4px;
}
</style>
