<script setup lang="ts">
import { BlockOfType, EditorType } from "../../blocknote";
import { ref, watch } from "vue";

const { editor, currentBlock: image } = defineProps<{
  editor: EditorType;
  currentBlock: BlockOfType<"image">;
}>();

const url = ref(image.props.url);

watch(url, (url) => {
  editor.updateBlock({ id: image.id }, { props: { url } });
});
</script>

<template>
  <input v-model="url" type="text" />
</template>
