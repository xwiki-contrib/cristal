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
import messages from "../translations";
import { inject } from "vue";
import { useI18n } from "vue-i18n";
import type { CristalApp } from "@xwiki/platform-api";

const cristal = inject<CristalApp>("cristal")!;

const { t } = useI18n({
  messages,
});
</script>

<template>
  <x-alert type="warning" flat-corners>
    <i18n-t keypath="xwiki.auth.service.banner" tag="span">
      <template #link>
        <!-- TODO: Use RemoteURLSerializer (CRISTAL-741). -->
        <a
          :href="`${cristal.getWikiConfig().baseURL}/bin/admin/XWiki/XWikiPreferences?section=Authentication`"
          >{{ t("xwiki.auth.service.banner.link") }}</a
        >
      </template>
    </i18n-t>
  </x-alert>
</template>

<style scoped>
a {
  text-underline-offset: 4px;
  font-weight: var(--cr-font-weight-semibold);
}
</style>
