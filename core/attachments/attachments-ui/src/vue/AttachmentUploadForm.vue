<script setup lang="ts">
import { FileInputModel } from "@xwiki/cristal-dsapi";
import { Ref, ref } from "vue";

defineProps<{ isUploading: boolean }>();
const fileInputValue: Ref<FileInputModel> = ref();
const emits = defineEmits<{
  (e: "files-selected", files: File[]): void;
}>();

defineExpose({
  reset() {
    fileInputValue.value = undefined;
  },
});

function submit() {
  if (fileInputValue.value) {
    let files: File[] = [];
    if (Array.isArray(fileInputValue.value)) {
      files = [...fileInputValue.value];
    } else if (fileInputValue.value) {
      files = [fileInputValue.value];
    }
    emits("files-selected", files);
  }
}
</script>

<template>
  <x-form @form-submit="submit">
    <x-file-input
      v-model="fileInputValue"
      label="Attachment"
      name="attachment"
      required
      :disabled="isUploading"
    ></x-file-input>
    <x-btn type="submit" :disabled="!fileInputValue">Upload</x-btn>
  </x-form>
</template>

<style scoped></style>
