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
import { CIcon, Size } from "@xwiki/platform-icons";
import { inject } from "vue";
import type { WikiConfigProxy } from "@xwiki/cristal-wiki-config-api";
import type { CristalApp, WikiConfig } from "@xwiki/platform-api";
import type { Ref } from "vue";

const cristal: CristalApp = inject<CristalApp>("cristal")!;
const wikiConfigProxy = cristal
  .getContainer()
  .get<WikiConfigProxy>("WikiConfigProxy")!;
const configs: Ref<Map<string, WikiConfig>> =
  wikiConfigProxy.getAvailableConfigurations();

function onConfigClick(configName: string) {
  if (configName !== cristal.getWikiConfig().name) {
    cristal?.switchConfig(configName);
  }
}
</script>

<template>
  <div class="config-container">
    <x-dropdown class="config-selector" :btn-props="{ variant: 'text' }">
      <template #activator>
        <span :class="$style.blackText">
          <c-icon name="chevron-expand" :size="Size.Small"></c-icon>
          {{ cristal.getWikiConfig().name }}
        </span>
      </template>
      <x-menu>
        <x-menu-item
          v-for="[key, wikiConfig] in configs"
          :value="key"
          @click="onConfigClick(key)"
          :disabled="key === cristal.getWikiConfig().name"
          :key="key"
          class="item"
        >
          <div>
            {{ wikiConfig.name }}
            <i
              ><small>{{ wikiConfig.designSystem }}</small></i
            >
          </div>
          <div class="url">{{ wikiConfig.baseURL }}</div>
        </x-menu-item>
      </x-menu>
    </x-dropdown>
    <x-btn
      variant="text"
      @click="
        cristal.getRouter().push({
          name: 'admin',
          params: { page: 'settings.categories.configurations' },
        })
      "
      ><c-icon :size="Size.Small" name="gear" :class="$style.blackText"></c-icon
    ></x-btn>
  </div>
</template>

<style scoped>
.config-container {
  display: flex;
}

.config-container > *:first-child {
  flex-grow: 1;
  cursor: pointer;
}

.url {
  font-weight: var(--cr-font-weight-semi-bold);
  color: var(--cr-color-neutral-500);
  font-size: var(--cr-font-size-small);
  overflow-wrap: break-word;
  line-height: var(--cr-font-size-small);
  width: 100%;
}

.item:focus-visible .url {
  color: inherit;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>

<style module>
.blackText {
  color: var(--cr-base-text-color);
}
</style>
