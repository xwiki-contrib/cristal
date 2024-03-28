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
import xlogo from "../images/xwiki-logo-mono.svg";
const logo = xlogo;
</script>
<template>
  <x-navigation-drawer id="sidebar">
    <UIX uixname="sidebar.before" />
    <div class="sidebar-header">
      <div class="left">
        
        <!-- TODO CRISTAL-165: Need icon/icon button component from DS -->
        <span class="hamburguer">|||</span>

        <x-img :src="logo" />
      </div>
      <div class="right">
        <!-- TODO CRISTAL-165: Need icon/icon button component from DS -->
        <span class="bell">bell</span>
        <x-avatar></x-avatar>
        <c-config-menu></c-config-menu>
      </div>
    </div>
    <div class="search">
      <x-search></x-search>
    </div>
    <div class="scrolling">
      <div style="height: 9999px;">
        <p>The size here is exagerated to test the overflow mechanics (scrolling)</p>
      </div>
      <!--    <CTemplate name="panel" panel-name="Help.TipsPanel.WebHome" />-->
      <!--    <CTemplate name="panel" panel-name="Panels.Applications" />-->
      <!--    <CTemplate name="panel" panel-name="Panels.Navigation" />-->
      <!--    <CTemplate name="panel" panel-name="Sandbox.TestPanel" />-->
      <UIX uixname="sidebar.after" />
    </div>
  </x-navigation-drawer>
</template>
<style scoped>
#sidebar {
  display: flex;
  flex-flow: column;
  gap: 16px;
  overflow: hidden;
}
.scrolling {
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
.right {
  margin-left: auto;
  display: flex;
  flex-flow: row;
  align-items: center;
  gap: 4px;
}
.left {
  margin-left: auto;
  display: flex;
  flex-flow: row;
  gap: 4px;
}
</style>
