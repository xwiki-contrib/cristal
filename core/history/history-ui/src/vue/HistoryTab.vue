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
import { type Ref, inject, onMounted, ref } from "vue";
import { type CristalApp, PageData } from "@xwiki/cristal-api";
import {
  type PageRevision,
  type PageRevisionManagerProvider,
} from "@xwiki/cristal-history-api";
import {
  type DocumentService,
  name as documentServiceName,
} from "@xwiki/cristal-document-api";

import { useI18n } from "vue-i18n";

const { t } = useI18n({
  messages,
});
const cristal: CristalApp = inject<CristalApp>("cristal")!;
const documentService = cristal
  .getContainer()
  .get<DocumentService>(documentServiceName);
const currentPage: Ref<PageData | undefined> =
  documentService.getCurrentDocument();
const revisions: Ref<Array<PageRevision>> = ref([]);

onMounted(async () => {
  if (currentPage.value) {
    revisions.value = await cristal
      .getContainer()
      .get<PageRevisionManagerProvider>("PageRevisionManagerProvider")
      .get()
      .getRevisions(currentPage.value);
  }
});
</script>

<template>
  <p>{{ t("history.extraTabs.header", { nRevisions: revisions.length }) }}</p>
  <br />
  <table>
    <tr v-for="revision of revisions" :key="revision.version">
      <td class="history-revision-cell">
        <span class="history-revision">{{ revision.version }}</span>
      </td>
      <td>
        <a :href="revision.url">{{
          revision.date.toLocaleString(undefined, {
            dateStyle: "short",
            timeStyle: "short",
          })
        }}</a>
        {{ t("history.extraTabs.entry.separator") }} {{ revision.user }}
        <br />
        {{ revision.comment }}
      </td>
    </tr>
  </table>
</template>

<style scoped>
p {
  font-size: var(--cr-font-size-medium);
}
table {
  border-collapse: collapse;
}
table tr:hover {
  background-color: var(--cr-color-neutral-200);
}
table td {
  vertical-align: top;
  padding: var(--cr-spacing-small);
}
table td:first-child {
  border-radius: var(--cr-border-radius-medium) 0 0
    var(--cr-border-radius-medium);
}
table td:last-child {
  border-radius: 0 var(--cr-border-radius-medium) var(--cr-border-radius-medium)
    0;
}
table .history-revision-cell {
  text-align: center;
}
table .history-revision {
  background-color: var(--cr-color-neutral-300);
  border-radius: var(--cr-border-radius-pill);
  padding: var(--cr-spacing-2x-small);
}
</style>
