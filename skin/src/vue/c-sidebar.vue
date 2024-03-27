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
        <span class="hamburguer">|||</span>
        <x-img :src="logo" />
      </div>
      <div class="right">
        <span class="bell">bell</span>
        <span class="avatar">AV</span>
        <c-config-menu></c-config-menu>
      </div>
    </div>
    <x-search></x-search>
    <!--    <CTemplate name="panel" panel-name="Help.TipsPanel.WebHome" />-->
    <!--    <CTemplate name="panel" panel-name="Panels.Applications" />-->
    <!--    <CTemplate name="panel" panel-name="Panels.Navigation" />-->
    <!--    <CTemplate name="panel" panel-name="Sandbox.TestPanel" />-->
    <UIX uixname="sidebar.after" />
  </x-navigation-drawer>
</template>
<style scoped>
:global(.sidebar-header) {
  display: flex;
  flex-flow: row;
}
:global(.right) {
  margin-left: auto;
}
</style>
