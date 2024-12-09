<script setup lang="ts">
import { CIcon, Size } from "@xwiki/cristal-icons";
import { LinkType } from "@xwiki/cristal-link-suggest-api";
defineProps<{
  link: {
    type: LinkType;
    title: string;
    segments: string[];
  };
}>();
</script>

<template>
  <c-icon
    class="icon-type"
    :size="Size.Small"
    :name="link.type == LinkType.PAGE ? 'file-earmark' : 'paperclip'"
  />
  {{ link.title }}
  <XBreadcrumb
    :items="
      link.segments.map((segment) => {
        return { label: segment };
      })
    "
  ></XBreadcrumb>
</template>

<style scoped></style>
