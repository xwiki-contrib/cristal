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
</script>
<template>
  <x-layout>
    <div id="view" class="wrapper">
      <UIX uixname="view.before" />
      <!-- TODO CRISTAL-165: The collapsed sidebar appears when the user click on the bars icon besides the logo. Click it again on THIS component should return the sidebar visible. 
        This version is also shown when the layout enters in mobile mode, in this mode when the users click the button a temporary sidebar should appear over the content-->
      <div class="collapsed-sidebar">|||</div>

      <CTemplate name="sidebar" />
      <CTemplate name="header" />
      <CTemplate name="main" />
      
      <!-- TODO CRISTAL-165: Eventually we will need a right sidebar-->
      <div class="right-sidebar">
        <div style="height: 9999px;">
          <p>If this element (.right-sidebar) is removed from the page, the layout should adapt automatically.</p>
          <p>The size here is exagerated to test the overflow mechanics (scrolling)</p>

        </div>
      </div>

      <UIX uixname="view.after" />
    </div>
  </x-layout>
</template>
<style scoped>
.collapsed-sidebar {
  display: none;
  background: var(--sl-color-gray-100);
  grid-area: collapsed-sidebar;
}
</style>
