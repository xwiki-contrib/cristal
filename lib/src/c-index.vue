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
<!-- TODO CRISTAL-165: these styles need to me moved to a generic CSS that loads last in the main template-->
<style scoped>
:global(html),
:global(body),
:global(#app),
:global(main),
:global(#content),
:global(#xwikicontent) {
  height: 100vh;
  overflow: hidden; 
  position: relative;
}

/* TODO CRISTAL-165: this rule !important should be removed when reorganizing the css as the comment above instructs. */
:global(html) {
  overflow: hidden !important;
}
:global(#xwikicontent) {
  overflow: auto;
}
:global(.wrapper) {
  height: 100vh;
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-areas: "sidebar content";
}

:global(.wrapper:has(.right-sidebar)) {
  grid-template-columns: 250px 1fr 250px;
  grid-template-areas: "sidebar content right-sidebar";
}
/* TODO CRISTAL-165: move this to shoelace component scoped styles*/
:global(.right-sidebar) {
  background-color: var(--sl-color-gray-100);
  padding: 8px;
  overflow: auto;
}
:global(#content) {
  display: flex;
  flex-flow: column;
  grid-area: content;  
}
:global(#xwikicontent) {
  overflow: auto;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
}

:global(#header) {
  grid-area: header;
}


:global(#sidebar) {
  grid-area: sidebar;
}

:global(footer) {
  grid-area: footer;
  background-color: #005ed8;
}
@media (max-width: 500px) {
  /* TODO CRISTAL-165: all of these !important declarations should be unecessary when the CSS structure is refactored */
  :global(.wrapper) {
    grid-template-columns: 24px 1fr !important;
    grid-template-areas: "collapsed-sidebar content" !important;
  }
  :global(.collapsed-sidebar) {
    display: block !important;
  }
  :global(#sidebar) {
    display: none !important;
  }
  :global(.right-sidebar) {
    display: none;
  }
}
</style>
