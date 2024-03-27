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
<script lang="ts">
import { CTemplate } from "@cristal/skin";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    CTemplate,
  },
  setup() {},
});
</script>
<template>
  <CTemplate name="view" />
</template>
<style scoped>
:global(html) {
  height: 100vh;
  overflow: hidden;
  position: relative;
}
:global(body) {
  height: 100vh;
  overflow: hidden;
  position: relative;
}
:global(#app) {
  height: 100vh;
  overflow: hidden;
  position: relative;
}
:global(main) {
  height: 100vh;
  overflow: hidden;
  position: relative;
}
:global(#content) {
  height: 100vh;
  overflow: hidden;
  position: relative;
}
:global(#xwikicontent) {
  height: 100vh;
  overflow: auto;
  position: relative;
}
:global(.wrapper) {
  height: 100vh;
  display: grid;
  grid-template-columns: 250px 5fr;
  grid-template-areas: "sidebar content";
}

:global(#header) {
  grid-area: header;
}

:global(#content) {
  grid-area: content;
  padding: 8px;
}

:global(#sidebar) {
  grid-area: sidebar;
  padding: 8px;
}

:global(footer) {
  grid-area: footer;
  background-color: #005ed8;
}
@media (max-width: 500px) {
  :global(.wrapper) {
    grid-template-columns: 4fr;
    grid-template-areas:
      "header"
      "content"
      "sidebar"
      "footer";
  }
}
</style>
