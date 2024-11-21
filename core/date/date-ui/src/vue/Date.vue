<script lang="ts" setup>
import { CristalApp } from "@xwiki/cristal-api";
import { DateService } from "@xwiki/cristal-date-api";
import { inject } from "vue";

defineProps<{ date: Date }>();
const cristal = inject<CristalApp>("cristal")!;

const dateService = cristal.getContainer().get<DateService>("DateService");
</script>

<template>{{ dateService.format(date) }}</template>

<style scoped></style>
