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

import { UserDetails } from "@xwiki/cristal-authentication-api";
import { contextBridge, ipcRenderer } from "electron";

let loggedInUserId: string | undefined = undefined;

contextBridge.exposeInMainWorld("authenticationNextcloud", {
  async loginOauth2(
    baseUrl: string,
    authenticationBaseUrl: string,
  ): Promise<void> {
    return ipcRenderer.invoke("authentication:nextcloud:loginOauth2", {
      baseUrl,
      authenticationBaseUrl,
    });
  },

  async loginBasic(username: string, password: string): Promise<void> {
    return ipcRenderer.invoke("authentication:nextcloud:loginBasic", {
      username,
      password,
    });
  },

  async isLoggedIn(mode: string): Promise<boolean> {
    return ipcRenderer.invoke("authentication:nextcloud:isLoggedIn", {
      mode,
    });
  },

  async getUserDetails(mode: string): Promise<UserDetails> {
    const userDetails: UserDetails = await ipcRenderer.invoke(
      "authentication:nextcloud:userDetails",
      {
        mode,
      },
    );

    loggedInUserId = userDetails.username;
    return userDetails;
  },

  async getAuthorizationValue(
    mode: string,
  ): Promise<{ tokenType: string; accessToken: string }> {
    return ipcRenderer.invoke("authentication:nextcloud:authorizationValue", {
      mode,
    });
  },

  async logout(mode: string): Promise<void> {
    await ipcRenderer.invoke("authentication:nextcloud:logout", {
      mode,
    });
  },

  async refreshToken(
    baseUrl: string,
    authenticationBaseUrl: string,
  ): Promise<void> {
    await ipcRenderer.invoke("authentication:nextcloud:refreshToken", {
      baseUrl,
      authenticationBaseUrl,
    });
  },

  getUserId(): string | undefined {
    return loggedInUserId;
  },
});
