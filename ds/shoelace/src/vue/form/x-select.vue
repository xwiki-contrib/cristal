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
import "@shoelace-style/shoelace/dist/components/option/option";
import "@shoelace-style/shoelace/dist/components/select/select";
import { computed } from "vue";
import type { SelectProps } from "@xwiki/platform-dsapi";

const { items } = defineProps<SelectProps>();

const selected = defineModel<string>();

// An item is either a string, used both as the value and as the label, or an object with a distinct value and label
// (see SelectItem in @xwiki/platform-dsapi).
const options = computed(() =>
  items.map((item: string | { value: string; label: string }) =>
    typeof item === "string" ? { value: item, label: item } : item,
  ),
);
</script>
<template>
  <sl-select
    :label="label"
    :help-text="help"
    :required="required"
    :value="selected"
    :clearable="!required"
    @sl-change="selected = $event.target.value"
    @sl-hide.stop
  >
    <sl-option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      >{{ option.label }}</sl-option
    >
  </sl-select>
</template>
