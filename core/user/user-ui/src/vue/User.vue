<script lang="ts" setup>
// TODO: replace with an actual user type, for now this component is mostly useful to centralize
// user display use. Several ways to display user or users must be provided over time, and more adapted
// to the design systems.
defineProps<{ user: string }>();
</script>

<template>{{ user }}</template>

<style scoped></style>
