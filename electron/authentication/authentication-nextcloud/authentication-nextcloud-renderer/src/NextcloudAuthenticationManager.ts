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
import { NextcloudAuthenticationState } from "@xwiki/cristal-authentication-nextcloud-state";
import AsyncLock from "async-lock";
import { inject, injectable } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type { AuthenticationManager } from "@xwiki/cristal-authentication-api";

interface AuthenticationWindow extends Window {
  authenticationNextcloud: {
    loginOauth2: (
      baseUrl: string,
      authenticationBaseUrl: string,
    ) => Promise<void>;

    loginBasic: (username: string, password: string) => Promise<void>;

    isLoggedIn(mode: "oauth2" | "basic"): Promise<boolean>;

    getUserDetails(mode: "oauth2" | "basic"): Promise<UserDetails>;

    getAuthorizationValue(mode: "oauth2" | "basic"): Promise<{
      tokenType: string;
      accessToken: string;
    }>;

    logout(mode: "oauth2" | "basic"): Promise<void>;

    refreshToken: (
      baseUrl: string,
      authenticationBaseUrl: string,
    ) => Promise<void>;
  };
}
declare const window: AuthenticationWindow;

@injectable()
class NextcloudAuthenticationManager implements AuthenticationManager {
  constructor(
    @inject("CristalApp") private readonly cristalApp: CristalApp,
    @inject(NextcloudAuthenticationState)
    private readonly authenticationState: NextcloudAuthenticationState,
  ) {}

  private readonly lock = new AsyncLock();

  async start(): Promise<void> {
    const config = this.cristalApp.getWikiConfig();

    if (config.authenticationMode == "oauth2") {
      await window.authenticationNextcloud.loginOauth2(
        config.baseURL,
        config.authenticationBaseURL!,
      );
    } else {
      this.authenticationState.callback.value = async () => {
        await window.authenticationNextcloud.loginBasic(
          this.authenticationState.username.value,
          this.authenticationState.password.value,
        );
      };
      this.authenticationState.modalOpened.value = true;
    }
  }

  async callback(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async getAuthorizationHeader(): Promise<string | undefined> {
    const authenticationMode = this.getAuthenticationMode();
    const authenticated = await this.isAuthenticated();
    if (authenticated) {
      if (authenticationMode == "oauth2") {
        await this.lock.acquire("refresh", async () => {
          await window.authenticationNextcloud.refreshToken(
            this.cristalApp.getWikiConfig().baseURL,
            this.cristalApp.getWikiConfig().authenticationBaseURL!,
          );
        });
      }
      const { tokenType, accessToken } =
        await window.authenticationNextcloud.getAuthorizationValue(
          authenticationMode,
        );
      return `${tokenType} ${accessToken}`;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return window.authenticationNextcloud.isLoggedIn(
      this.getAuthenticationMode(),
    );
  }

  async getUserDetails(): Promise<UserDetails> {
    return window.authenticationNextcloud.getUserDetails(
      this.getAuthenticationMode(),
    );
  }

  async logout(): Promise<void> {
    await window.authenticationNextcloud.logout(this.getAuthenticationMode());
  }

  private getAuthenticationMode(): "oauth2" | "basic" {
    const config = this.cristalApp.getWikiConfig();
    return config.authenticationMode ?? "basic";
  }
}

export { NextcloudAuthenticationManager };
