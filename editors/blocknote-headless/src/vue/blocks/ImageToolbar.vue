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
import ImageFilePanel from "./ImageFilePanel.vue";
import ToolbarButtonSet from "./ToolbarButtonSet.vue";
import { BlockOfType, EditorType } from "../../blocknote";
import { LinkEditionContext } from "../../components/linkEditionContext";
import { ref, watch } from "vue";

const {
  editor,
  currentBlock: image,
  linkEditionCtx,
} = defineProps<{
  editor: EditorType;
  currentBlock: BlockOfType<"image">;
  linkEditionCtx: LinkEditionContext;
}>();

const url = ref(image.props.url);

watch(url, (url) => {
  editor.updateBlock({ id: image.id }, { props: { url } });
});

const showImagePanel = ref(false);
</script>

<template>
  <ToolbarButtonSet
    :buttons="[
      {
        icon: 'pencil',
        title: 'Edit',
        onClick() {
          showImagePanel = !showImagePanel;
        },
      },
      {
        icon: 'trash',
        title: 'Delete',
        onClick() {
          editor.removeBlocks([image.id]);
        },
      },
    ]"
  />

  <div v-if="showImagePanel" class="imageSelector">
    <ImageFilePanel
      :current-block="image"
      :link-edition-ctx
      :editor
      @update="editor.focus()"
    />
  </div>
</template>

<style scoped>
/*
  NOTE: Popover is implemented manually here due to positioning problems with Tippy + considerations to switch to Floating UI now that Tippy is deprecated
  This is temporary and will be replaced with a "proper" solution using a dedicated library in the near future
*/
.imageSelector {
  position: absolute;
  left: 0;
  /* Yes, this is dirty */
  top: 2.5rem;
  background: white;
  box-shadow: 0px 4px 12px #cfcfcf;
  border-radius: 6px;
}
</style>
