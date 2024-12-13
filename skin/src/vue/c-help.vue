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
import { CIcon } from "@xwiki/cristal-icons";
import { useI18n } from "vue-i18n";

const { t } = useI18n({
  messages,
});

function onClick() {
  // TODO: Add an actual Help section (CRISTAL-373).
  window.open(
    "https://cristal.xwiki.org/xwiki/bin/view/Documentation/UserGuide/",
    "_blank",
  );
}
</script>
<template>
  <div class="help-button">
    <x-btn pill size="small" @click="onClick">
      <c-icon name="question-circle"></c-icon>
      {{ t("help.label") }}
    </x-btn>
  </div>
</template>

<style scoped></style>
