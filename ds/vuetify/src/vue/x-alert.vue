<template>
  <v-alert :title="title" :type="type">
    <slot />
  </v-alert>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type { VAlert } from "vuetify/lib/components/VAlert/index.mjs";

export default {
  components: {},
  props: {
    title: { type: String, required: true },
    type: {
      type: Object as PropType<VAlert["type"] | undefined>,
      required: true,
    },
  },
};
</script>
