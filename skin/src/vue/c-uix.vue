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
import { inject, shallowRef } from "vue";
import type { CristalApp, Logger } from "@xwiki/cristal-api";
import type { Component } from "vue";

let components: Array<Component> = [];
let logger: Logger | undefined = undefined;

const props = defineProps<{ uixname: string }>();
const cristal = inject<CristalApp>("cristal");
if (cristal) {
  components = await cristal.getUIXTemplates(props.uixname);
  logger = cristal.getLogger("skin.vue.template");
}

const comps = shallowRef(components);
logger?.debug("Extension Point name", props.uixname);
</script>
<template>
  <!-- eslint-disable vue/valid-v-for TODO introduce a key on components. -->
  <component :is="component" v-for="component in comps" />
</template>
