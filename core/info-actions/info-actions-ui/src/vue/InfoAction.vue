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
import { CIcon } from "@xwiki/cristal-icons";
import { InfoAction } from "@xwiki/cristal-info-actions-api";
import { watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const props = defineProps<{ infoAction: InfoAction }>();

function refresh(): Promise<void> | undefined {
  return props.infoAction.refresh?.(route.params.page as string);
}

watch(() => route.params.page, refresh);
// We don't use immediate in the watch because we want to be able to wait on
// the first refresh call, to have an initialized counter.
await refresh();
const counter = await props.infoAction.counter();
</script>

<template>
  <div :class="['info-action', infoAction.id]">
    <c-icon :name="infoAction.iconName"></c-icon>
    <span class="counter">{{ counter }}</span>
    <!-- TODO: add a way to jump to the extra tabs. -->
  </div>
</template>

<style scoped>
.info-action {
  display: flex;
  background-color: var(--cr-color-neutral-100);
  border-radius: var(--cr-border-radius-medium);
  padding: var(--cr-spacing-x-small) var(--cr-spacing-x-small);
  font-size: var(--cr-font-size-medium);
  flex-flow: row;
  gap: var(--cr-spacing-2x-small);
  align-items: center;
}

.info-action .cr-icon {
  line-height: 1.3rem;
}

.counter {
  background-color: var(--cr-color-primary-600);
  font-weight: var(--cr-font-weight-semibold);
  font-size: var(--cr-font-size-x-small);
  line-height: var(--cr-font-size-2x-small);
  border-radius: 99px;
  color: #fff;
  flex-shrink: 1;
  flex-grow: 0;
  display: block;
  padding: var(--cr-spacing-2x-small) var(--cr-spacing-x-small);
}
</style>
