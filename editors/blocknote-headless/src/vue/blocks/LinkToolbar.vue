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
import LinkEditor from "./LinkEditor.vue";
import { EditorType } from "../../blocknote";
import { LinkEditionContext } from "../../components/linkEditionContext";
import { LinkToolbarProps } from "@blocknote/react";
import { tryFallible } from "@xwiki/cristal-fn-utils";
import { CIcon } from "@xwiki/cristal-icons";
import { ref } from "vue";

const { linkToolbarProps } = defineProps<{
  editor: EditorType;
  linkToolbarProps: LinkToolbarProps;
  linkEditionCtx: LinkEditionContext;
}>();

const editingLink = ref(false);

function openTarget() {
  if (linkToolbarProps.url) {
    window.open(linkToolbarProps.url);
  }
}
</script>

<template>
  <div class="container">
    <x-btn variant="text" @click="editingLink = !editingLink">Edit link</x-btn>

    <x-btn variant="text" @click="openTarget">
      <c-icon name="box-arrow-up-right" />
    </x-btn>

    <x-btn variant="text" @click="linkToolbarProps.deleteLink()">
      <c-icon name="trash" />
    </x-btn>

    <LinkEditor
      v-if="editingLink"
      :link-edition-ctx
      :current="{
        url: linkToolbarProps.url,
        reference: tryFallible(
          () =>
            linkEditionCtx.remoteURLParser.parse(linkToolbarProps.url) ?? null,
        ),
        title: linkToolbarProps.text,
      }"
      @update="({ url, title }) => linkToolbarProps.editLink(url, title)"
    />
  </div>
</template>

<style scoped>
.container {
  background-color: white;
  box-shadow: 0 1px 1px 1px #0f0f0f;
  border-radius: 5px;
}
</style>
