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
<script lang="ts" setup>
import { Ref, onMounted, ref, watch } from "vue";
import CTemplate from "./c-template.vue";
import CMain from "./c-main.vue";
import { ViewportType, useViewportType } from "../composables/viewport";
import "../css/main.css";

const viewportType: Ref<ViewportType> = useViewportType();
// By default, left sidebar is collapsed on mobile only.
const isLeftSidebarCollapsed: Ref<boolean> = ref(
  viewportType.value == ViewportType.Mobile,
);

onMounted(() => {
  // Attempt to load collapsed state from local storage.
  if (viewportType.value == ViewportType.Desktop) {
    isLeftSidebarCollapsed.value =
      localStorage.isLeftSidebarCollapsed === "true";
  }
});

watch(viewportType, (newViewportType: ViewportType) => {
  // Collapse left sidebar on smaller viewport,
  // load previous state from local storage on larger viewport.
  if (newViewportType == ViewportType.Mobile) {
    isLeftSidebarCollapsed.value = true;
  } else {
    isLeftSidebarCollapsed.value =
      localStorage.isLeftSidebarCollapsed === "true";
  }
});

function onCollapseLeftSidebar() {
  // Left sidebar should always be collapsed on mobile.
  if (viewportType.value == ViewportType.Desktop) {
    isLeftSidebarCollapsed.value = !isLeftSidebarCollapsed.value;
    localStorage.isLeftSidebarCollapsed = isLeftSidebarCollapsed.value;
  }
}
</script>
<template>
  <div>
    <!-- Lazy component in charge of loading design-system specific resources.
    For instance, CSS sheets. -->
    <x-load></x-load>
    <div
      id="view"
      class="wrapper"
      :class="{ 'sidebar-is-collapsed': isLeftSidebarCollapsed }"
    >
      <UIX uixname="view.before" />
      <CTemplate
        name="sidebar"
        @collapse-left-sidebar="onCollapseLeftSidebar"
      />
      <CTemplate name="header" />
      <c-main></c-main>

      <!-- TODO CRISTAL-165: Eventually we will need a right sidebar-->
      <!-- <c-right-sidebar></c-right-sidebar> -->

      <UIX uixname="view.after" />
    </div>
  </div>
</template>
<style scoped>
:global(#xwCristalApp) {
  container: xwCristal;
  container-type: size;
}

:global(html.xw-cristal),
:global(.xw-cristal body),
:global(.xw-cristal #xwCristalApp) {
  overflow: hidden;
  position: relative;
  height: 100%;
  font: var(--cr-base-font-size) var(--cr-font-sans);
  font-weight: var(--cr-font-weight-normal);
  line-height: var(--cr-line-height-normal);
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
}
:global(.xw-cristal #xwCristalApp),
:global(.xw-cristal #xwCristalApp > div) {
  height: 100%;
}

:global(html) {
  overflow: hidden;
}

:deep(.content),
:deep(.content-scroll) {
  overflow: hidden;
  position: relative;
}

:deep(.content) {
  display: flex;
  flex-flow: column;
  grid-area: content;
  height: 100%;
}

:deep(.content-scroll) {
  display: flex;
  flex-flow: column;
  align-items: center;
  overflow: auto;
  height: 100%;
  padding: var(--cr-spacing-x-small) var(--cr-spacing-2x-large);
}
/* 
.content-scroll > div {
  width: 100%;
  max-width: var(--cr-sizes-max-page-width);
} */

:deep(.center-content) {
  width: 100%;
  max-width: var(--cr-sizes-max-page-width);
}

:deep(.whole-content) {
  width: 100%;
  display: flex;
  flex-flow: column;
  gap: var(--cr-spacing-medium);
  align-items: center;
}

:deep(.document-content) {
  max-width: var(--cr-sizes-max-page-width);
  width: 100%;
  display: flex;
  flex-flow: column;
}

.wrapper {
  display: grid;
  grid-template-columns:
    minmax(
      var(--cr-sizes-left-sidebar-min-width),
      var(--cr-sizes-left-sidebar-width)
    )
    1fr;
  grid-template-rows: 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  height: 100%;
}

main {
  overflow: hidden;
  left: max(
    var(--cr-sizes-left-sidebar-min-width),
    var(--cr-sizes-left-sidebar-width)
  );
  z-index: 2;
  transition: var(--cr-transition-medium) left ease-in-out;
}

:deep(.left-sidebar) {
  width: var(--cr-sizes-left-sidebar-width);
  min-width: var(--cr-sizes-left-sidebar-min-width);
  max-width: 100%;
  position: relative;
  background-color: var(--cr-color-neutral-100);
  display: flex;
  flex-flow: column;
  gap: var(--cr-spacing-medium);
  overflow: hidden;
  border-right: 1px solid var(--cr-color-neutral-200);
  box-shadow: var(--cr-shadow-large);
  transition: var(--cr-transition-medium) translate ease-in-out;
  z-index: 3;
}

/*
TODO: these rules about opening and closing the sidebar should be better organized and described
*/

:deep(.close-sidebar) {
  display: none;
}

:deep(.pin-sidebar) {
  display: none;
}

:deep(.open-sidebar:hover),
:deep(.close-sidebar:hover),
:deep(.pin-sidebar:hover),
:deep(.hide-sidebar:hover) {
  cursor: pointer;
}

:deep(.wrapper .sidebar-collapse-controls) {
  display: none;
}
/*Rule for the sidebar when floating over content*/
:deep(.wrapper.sidebar-is-collapsed #sidebar:not(.is-visible)) {
  display: none;
}

:deep(.wrapper.sidebar-is-collapsed main) {
  left: var(--cr-sizes-collapsed-sidebar-width);
}

/*rules for the sidebar when collapsed */
:deep(.wrapper.sidebar-is-collapsed) {
  grid-template-columns: var(--cr-sizes-collapsed-sidebar-width) 1fr;
  &:has(.is-visible) {
    grid-template-columns:
      minmax(
        var(--cr-sizes-left-sidebar-min-width),
        var(--cr-sizes-left-sidebar-width)
      )
      1fr;
  }
}

:deep(.wrapper.sidebar-is-collapsed:has(.is-visible) .collapsed-sidebar) {
  display: none;
}

:deep(.wrapper.sidebar-is-collapsed .sidebar-collapse-controls) {
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  padding: var(--cr-spacing-small) var(--cr-spacing-x-small) 0;
  z-index: 2;
}

:deep(.wrapper.sidebar-is-collapsed .hide-sidebar) {
  display: none;
}

:deep(.wrapper.sidebar-is-collapsed .pin-sidebar) {
  display: block;
}

:deep(.wrapper.sidebar-is-collapsed .close-sidebar) {
  display: block;
}

:deep(.collapsed-sidebar) {
  display: none;
  background: var(--cr-color-neutral-100);
  width: var(--cr-sizes-collapsed-sidebar-width);
  padding-top: var(--cr-spacing-x-small);
  text-align: center;
  z-index: 1;
}

:deep(.wrapper.sidebar-is-collapsed .collapsed-sidebar) {
  display: block;
}

/*
WIKI STYLES
TODO: Discuss and move them to a more appropriate place
*/
:deep(.wikiexternallink) {
  font-style: italic;
}

@container xwCristal (max-width: 600px) {
  .wrapper {
    grid-template-columns: 16px 1fr;
  }
  :deep(.wrapper.sidebar-is-collapsed) {
    &:has(.left-sidebar.is-visible) {
      &:before {
        content: " ";
        background-color: var(--cr-overlay-background-color);
        position: fixed;
        width: unset;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 3;
      }
    }
  }

  .left-sidebar {
    width: 80%;
  }

  main {
    left: var(--cr-sizes-collapsed-sidebar-width);
  }

  .wrapper .sidebar-collapse-controls .pin-sidebar {
    display: none;
  }

  .resize-handle {
    display: none;
  }
}
</style>
