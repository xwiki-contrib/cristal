<script setup lang="ts">
import { LinkEditionContext } from "../../components/linkEditionContext";
import { LinkSuggestion } from "../../components/linkSuggest";
import { debounce } from "../../utils";
import { LinkType } from "@xwiki/cristal-link-suggest-api";
import { ref, watch } from "vue";

const { linkEditionCtx } = defineProps<{
  linkEditionCtx: LinkEditionContext;
}>();

const emit = defineEmits<{
  selected: [{ url: string; reference: string; title: string }];
}>();

const query = ref("");

const results = ref<LinkSuggestion[]>([]);

watch(
  query,
  debounce(async (query) => {
    const suggestions = await linkEditionCtx.suggestLink({ query });

    results.value = suggestions.filter(
      (suggestion) => suggestion.type === LinkType.PAGE,
    );
  }),
);

function select(result: LinkSuggestion) {
  emit("selected", {
    url: result.url,
    reference: result.reference,
    title: result.title,
  });

  results.value = [];
}
</script>

<template>
  <div>
    <input v-model="query" type="text" placeholder="Link query goes here" />

    <ul>
      <li v-for="result in results" :key="result.url" @click="select(result)">
        {{ result.title }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
tr {
  cursor: pointer;
}
</style>
