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

<script lang="ts" setup>
import messages from "../translations";
import { CristalApp } from "@xwiki/cristal-api";
import { inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";
import type { Ref } from "vue";

const { t } = useI18n({
  messages,
});

const cristal = inject<CristalApp>("cristal")!;

const authenticationManager = cristal
  .getContainer()
  .get<AuthenticationManagerProvider>("AuthenticationManagerProvider")
  .get();

const verificationUrl = "https://github.com/login/device";
const localStorageUserCode = "authentication.user_code";
const localStorageExpiresIn = "authentication.expires_in";

const userCode: Ref<string> = ref("");
const expiration: Ref<string> = ref("00:00");

async function login() {
  await authenticationManager?.start();

  userCode.value = window.localStorage.getItem(localStorageUserCode)!;
  let expirationSeconds: number = parseInt(
    window.localStorage.getItem(localStorageExpiresIn)!,
  );
  const intervalId = setInterval(() => {
    expirationSeconds--;
    expiration.value = new Date(expirationSeconds * 1000)
      .toISOString()
      .slice(11, 19);
    if (expirationSeconds == 0) {
      clearInterval(intervalId);
    }
  }, 1000);

  await authenticationManager?.callback();
}
</script>

<template>
  <x-dialog width="auto" title="GitHub Login">
    <template #activator="{ props }">
      <x-btn
        v-if="authenticationManager"
        v-bind="props"
        size="small"
        type="submit"
        variant="primary"
        @click="login"
      >
        {{ t("login") }}
      </x-btn>
    </template>
    <template #default>
      Step 1: Copy the following code
      <x-text-field
        v-model="userCode"
        label="User Code"
        readonly
      ></x-text-field>
      Step 2: Click <a :href="verificationUrl" target="_blank">here</a>, paste
      the code and authorize the application. <br /><br />Time left:
      {{ expiration }}.
    </template>
  </x-dialog>
</template>
