/*
 * See the LICENSE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

import Store from "electron-store";
import type { AuthenticationMode } from "@xwiki/cristal-api";

const tokenTypeKey = "tokenType";

const accessTokenKey = "accessToken";

const refreshTokenKey = "refreshToken";

const expiryDateKey = "expiryDate";

const userIdKey = "userId";

const schema = {
  tokenType: {
    type: "string",
  },

  accessToken: {
    type: "string",
  },

  refreshToken: {
    type: "string",
  },

  expiryDate: {
    type: "number",
  },

  userId: {
    type: "string",
  },
};

const storeInstance: Store = new Store({
  name: "authentication-nextcloud-main",
  schema,
  // TODO: add encryption key
});

function set<T>(key: string, value: T, mode: AuthenticationMode) {
  // @ts-expect-error type resolution failing because of electron-store library bug
  storeInstance.set(`${key}-${mode}`, value);
}

function get<T>(key: string, mode: AuthenticationMode): T {
  // @ts-expect-error type resolution failing because of electron-store library bug
  return storeInstance.get(`${key}-${mode}`) as T;
}

function rm(key: string, mode: AuthenticationMode) {
  // @ts-expect-error type resolution failing because of electron-store library bug
  storeInstance.delete(`${key}-${mode}`);
}

function setTokenType(value: string, mode: AuthenticationMode): void {
  set(tokenTypeKey, value, mode);
}

function setAccessToken(value: string, mode: AuthenticationMode): void {
  set(accessTokenKey, value, mode);
}

function setRefreshToken(value: string, mode: AuthenticationMode): void {
  set(refreshTokenKey, value, mode);
}

function setExpiryDate(value: number, mode: AuthenticationMode): void {
  set(expiryDateKey, value, mode);
}

function setUserId(value: string, mode: AuthenticationMode): void {
  set(userIdKey, value, mode);
}

function getTokenType(mode: AuthenticationMode): string {
  return get(tokenTypeKey, mode);
}

function getAccessToken(mode: AuthenticationMode): string {
  return get(accessTokenKey, mode);
}

function getRefreshToken(mode: AuthenticationMode): string {
  return get(refreshTokenKey, mode);
}

function getExpiryDate(mode: AuthenticationMode): number {
  return get(expiryDateKey, mode);
}

function getUserId(mode: AuthenticationMode): string {
  return get(userIdKey, mode);
}

function deleteTokenType(mode: AuthenticationMode): void {
  rm(tokenTypeKey, mode);
}

function deleteAccessToken(mode: AuthenticationMode): void {
  rm(accessTokenKey, mode);
}

function deleteRefreshToken(mode: AuthenticationMode): void {
  rm(refreshTokenKey, mode);
}

function deleteExpiryDate(mode: AuthenticationMode): void {
  rm(expiryDateKey, mode);
}

function deleteUserId(mode: AuthenticationMode): void {
  rm(userIdKey, mode);
}

export {
  deleteAccessToken,
  deleteExpiryDate,
  deleteRefreshToken,
  deleteTokenType,
  deleteUserId,
  getAccessToken,
  getExpiryDate,
  getRefreshToken,
  getTokenType,
  getUserId,
  setAccessToken,
  setExpiryDate,
  setRefreshToken,
  setTokenType,
  setUserId,
};
