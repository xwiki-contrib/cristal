<script setup lang="ts">
import { inject } from "vue";
import { CristalApp } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";
import { useI18n, I18nT } from "vue-i18n";
import messages from "../translations";

const { t } = useI18n({
  messages,
});

const cristal = inject<CristalApp>("cristal")!;

const authenticationManager = cristal
  .getContainer()
  .get<AuthenticationManagerProvider>("AuthenticationManagerProvider")
  .get()!;

const { profile, name } = await authenticationManager.getUserDetails();

function logout() {
  authenticationManager.logout().then(() => window.location.reload());
}
</script>

<template>
  <i18n-t keypath="userDescription" tag="span">
    <a :href="profile">{{ name }}</a>
  </i18n-t>
  <br />
  <br />
  <x-btn variant="danger" @click.prevent="logout">{{ t("logout") }}</x-btn>
</template>
