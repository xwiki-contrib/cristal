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

import { AuthenticationManager } from "@xwiki/cristal-authentication-api";
import { NextcloudAuthenticationState } from "@xwiki/cristal-authentication-nextcloud-state";
import AsyncLock from "async-lock";
import axios from "axios";
import { inject, injectable } from "inversify";
import Cookies from "js-cookie";
import type { CristalApp, WikiConfig } from "@xwiki/cristal-api";
import type { UserDetails } from "@xwiki/cristal-authentication-api";
import type { CookieAttributes } from "js-cookie";

/**
 * {@link AuthenticationManager} for the Nextcloud backend.
 *
 * @since 0.16
 */
@injectable()
export class NextcloudAuthenticationManager implements AuthenticationManager {
  constructor(
    @inject("CristalApp") private readonly cristalApp: CristalApp,
    @inject(NextcloudAuthenticationState)
    private readonly authenticationState: NextcloudAuthenticationState,
  ) {}

  private readonly localStorageConfigName = "currentConfigName";

  private readonly localStorageConfigType = "currentConfigType";

  private readonly localStorageConfigBaseUrl = "currentConfigBaseUrl";

  private readonly localStorageOriginKey = "authentication.origin";

  private readonly localStorageRedirectUriKey = "authentication.redirect_uri";

  private readonly localStorageTokenUrlKey = "authentication.token_url";

  private readonly tokenTypeCookieKeyPrefix = "tokenType";

  private readonly accessTokenCookieKeyPrefix = "accessToken";

  private readonly refreshTokenCookieKeyPrefix = "refreshToken";

  private readonly expiryDateCookieKeyPrefix = "expiryDate";

  private readonly userIdCookieKeyPrefix = "userId";

  private readonly lock = new AsyncLock();

  private readonly cookiesOptions: CookieAttributes = {
    secure: true,
    sameSite: "strict",
  };

  async start(): Promise<void> {
    const config = this.cristalApp.getWikiConfig();

    // TODO: to be moved as part of a more generic API
    window.localStorage.setItem(this.localStorageConfigName, config.name);
    window.localStorage.setItem(this.localStorageConfigType, config.getType());
    window.localStorage.setItem(this.localStorageConfigBaseUrl, config.baseURL);

    if (config.authenticationMode == "oauth2") {
      await this.startOauth2(config);
    } else {
      this.authenticationState.callback.value = () => {
        Cookies.set(
          this.getAccessTokenCookieKey(config.name),
          btoa(
            `${this.authenticationState.username.value}:${this.authenticationState.password.value}`,
          ),
          this.cookiesOptions,
        );
        Cookies.set(
          this.getTokenTypeCookieKey(config.name),
          "Basic",
          this.cookiesOptions,
        );
        Cookies.set(
          this.getUserIdCookieKey(config.name),
          this.authenticationState.username.value,
          this.cookiesOptions,
        );
        // We reload the content on successful login.
        window.location.reload();
      };
      this.authenticationState.modalOpened.value = true;
    }
  }

  async startOauth2(config: WikiConfig): Promise<void> {
    const authorizationUrl = new URL(
      `${config.authenticationBaseURL}/authorize`,
    );
    authorizationUrl.searchParams.set("base_url", config.baseURL);
    const { host, protocol } = window.location;
    const redirectUri = `${protocol}//${host}/callback`;
    window.localStorage.setItem(this.localStorageRedirectUriKey, redirectUri);
    window.localStorage.setItem(
      this.localStorageTokenUrlKey,
      `${config.authenticationBaseURL}/token`,
    );
    window.localStorage.setItem(
      this.localStorageOriginKey,
      window.location.toString(),
    );

    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    window.location.href = authorizationUrl.toString();
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async callback(): Promise<void> {
    const href = new URL(window.location.href);
    const code = href.searchParams.get("code");
    const tokenUrl = new URL(
      window.localStorage.getItem(this.localStorageTokenUrlKey)!,
    );
    tokenUrl.searchParams.set(
      "base_url",
      window.localStorage.getItem(this.localStorageConfigBaseUrl)!,
    );
    tokenUrl.searchParams.set("code", code!);
    tokenUrl.searchParams.set(
      "redirect_uri",
      window.localStorage.getItem(this.localStorageRedirectUriKey)!,
    );

    const { data: tokenData } = await axios.get(tokenUrl.toString());
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      token_type: tokenType,
      user_id: userId,
    } = tokenData;

    const configName = window.localStorage.getItem(
      this.localStorageConfigName,
    )!;

    Cookies.set(
      this.getAccessTokenCookieKey(configName),
      accessToken,
      this.cookiesOptions,
    );
    Cookies.set(
      this.getTokenTypeCookieKey(configName),
      tokenType,
      this.cookiesOptions,
    );
    Cookies.set(
      this.getRefreshTokenCookieKey(configName),
      refreshToken,
      this.cookiesOptions,
    );
    Cookies.set(
      this.getExpiryDateCookieKey(configName),
      // We apply a safety margin of 10s to the expiration date.
      (Date.now() + (expiresIn - 10) * 1000).toString(),
      this.cookiesOptions,
    );
    Cookies.set(
      this.getUserIdCookieKey(configName),
      userId,
      this.cookiesOptions,
    );
    // Redirect to the page where the user was before starting the log-in.
    window.location.href = window.localStorage.getItem(
      this.localStorageOriginKey,
    )!;
  }

  async getUserDetails(): Promise<UserDetails> {
    const config = this.cristalApp.getWikiConfig();

    const userId = Cookies.get(this.getUserIdCookieKey());
    return {
      profile: `${config.baseURL}/u/${userId}`,
      username: userId,
      name: userId!, // TODO: Find a way to get the display name.
      avatar: `${config.baseURL}/avatar/${userId}/64`,
    };
  }

  async logout(): Promise<void> {
    // Logout is not supported through Netcloud's OAuth2 clients.
    // The best we can do is to remove the stored cookies.
    Cookies.remove(this.getTokenTypeCookieKey());
    Cookies.remove(this.getAccessTokenCookieKey());
    Cookies.remove(this.getUserIdCookieKey());
    Cookies.remove(this.getRefreshTokenCookieKey());
    Cookies.remove(this.getExpiryDateCookieKey());
  }

  async getAuthorizationHeader(): Promise<string | undefined> {
    const isAuthenticated = await this.isAuthenticated();
    if (isAuthenticated) {
      if (this.resolveConfig().authenticationMode == "oauth2") {
        await this.refreshToken();
      }
      return `${this.getTokenType()} ${Cookies.get(this.getAccessTokenCookieKey())}`;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return (
      this.getTokenType() !== undefined && this.getAccessToken() !== undefined
    );
  }

  private getTokenType() {
    return Cookies.get(this.getTokenTypeCookieKey());
  }

  private getAccessToken() {
    return Cookies.get(this.getAccessTokenCookieKey());
  }

  private getAccessTokenCookieKey(configName?: string) {
    const config = this.resolveConfig(configName);
    return `${this.accessTokenCookieKeyPrefix}-${config?.authenticationMode}-${config?.baseURL}`;
  }

  private getTokenTypeCookieKey(configName?: string) {
    const config = this.resolveConfig(configName);
    return `${this.tokenTypeCookieKeyPrefix}-${config?.authenticationMode}-${config?.baseURL}`;
  }

  private getUserIdCookieKey(configName?: string) {
    const config = this.resolveConfig(configName);
    return `${this.userIdCookieKeyPrefix}-${config?.authenticationMode}-${config?.baseURL}`;
  }

  private getRefreshTokenCookieKey(configName?: string) {
    const config = this.resolveConfig(configName);
    return `${this.refreshTokenCookieKeyPrefix}-${config?.authenticationMode}-${config?.baseURL}`;
  }

  private getExpiryDateCookieKey(configName?: string) {
    const config = this.resolveConfig(configName);
    return `${this.expiryDateCookieKeyPrefix}-${config?.authenticationMode}-${config?.baseURL}`;
  }

  private resolveConfig(configName?: string): WikiConfig {
    if (configName !== undefined) {
      return this.cristalApp.getAvailableConfigurations().get(configName)!;
    } else {
      return this.cristalApp.getWikiConfig();
    }
  }

  private async refreshToken() {
    await this.lock.acquire("refresh", async () => {
      if (Date.now() > parseInt(Cookies.get(this.getExpiryDateCookieKey())!)) {
        const refreshUrl = new URL(
          `${this.cristalApp.getWikiConfig().authenticationBaseURL}/refresh`,
        );
        refreshUrl.searchParams.set(
          "base_url",
          window.localStorage.getItem(this.localStorageConfigBaseUrl)!,
        );
        refreshUrl.searchParams.set(
          "refresh_token",
          Cookies.get(this.getRefreshTokenCookieKey())!,
        );

        const {
          data: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn,
          },
        } = await axios.get(refreshUrl.toString());

        Cookies.set(
          this.getAccessTokenCookieKey(),
          accessToken,
          this.cookiesOptions,
        );
        Cookies.set(
          this.getRefreshTokenCookieKey(),
          refreshToken,
          this.cookiesOptions,
        );
        Cookies.set(
          this.getExpiryDateCookieKey(),
          // We apply a safety margin of 10s to the expiration date.
          (Date.now() + (expiresIn - 10) * 1000).toString(),
          this.cookiesOptions,
        );
      }
    });
  }
}
