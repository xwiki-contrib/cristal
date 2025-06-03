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
import axios from "axios";
import { inject, injectable } from "inversify";
import { decodeJwt } from "jose";
import Cookies from "js-cookie";
import type { CristalApp } from "@xwiki/cristal-api";
import type { UserDetails } from "@xwiki/cristal-authentication-api";
import type { CookieAttributes } from "js-cookie";

/**
 */
@injectable()
export class DocsAuthenticationManager implements AuthenticationManager {
  constructor(@inject("CristalApp") private readonly cristalApp: CristalApp) {}

  private readonly localStorageOriginKey = "authentication.origin";

  private readonly localStorageRedirectUriKey =
    "authentication.docs.redirect_uri";

  private readonly localStorageTokenUrlKey = "authentication.docs.token_url";

  private readonly tokenTypeCookieKeyPrefix = "tokenType";

  private readonly accessTokenCookieKeyPrefix = "accessToken";

  private readonly baseURL = "http://localhost:8083/realms/impress/protocol";

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async start(): Promise<void> {
    const config = this.cristalApp.getWikiConfig();
    // TODO: make this url configurable.
    const authorizationUrl = new URL(`${this.baseURL}/openid-connect/auth`);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("scope", "openid email");
    // TODO: this client ID should be configurable somewhere.
    authorizationUrl.searchParams.set("client_id", "impress");
    // Note: unused parameters that we found when checking the network on the auth workflow of Docs
    // &state=ZwVTxDek1bUrt12EQA72Pgcn6OVCZXTM
    // &acr_values=eidas1
    // &nonce=jR4jy5Up9a6L7WiedUACDBLnjirvx9UB
    const { host, protocol } = window.location;
    const redirectUri = `${protocol}//${host}/callback`;
    window.localStorage.setItem(this.localStorageRedirectUriKey, redirectUri);
    window.localStorage.setItem(
      this.localStorageTokenUrlKey,
      `${this.baseURL}/openid-connect/token`,
    );
    window.localStorage.setItem(
      this.localStorageOriginKey,
      window.location.toString(),
    );

    // TODO: to be moved as part of a more generic API
    window.localStorage.setItem("currentConfigType", config.getType());
    window.localStorage.setItem("currentConfigName", config.name);

    authorizationUrl.searchParams.set("redirect_uri", redirectUri);
    window.location.href = authorizationUrl.toString();
  }

  // TODO: reduce the number of statements in the following method and reactivate the disabled eslint rule.
  // eslint-disable-next-line max-statements
  async callback(): Promise<void> {
    const href = new URL(window.location.href);
    const code = href.searchParams.get("code");
    const tokenUrl = window.localStorage.getItem(this.localStorageTokenUrlKey)!;
    const data = {
      grant_type: "authorization_code",
      code,
      redirect_uri: window.localStorage.getItem(
        this.localStorageRedirectUriKey,
      ),
      // TODO: access client id from configuration
      client_id: "impress",
      client_secret: "ThisIsAnExampleKeyForDevPurposeOnly",
    };
    const config = {
      // url: tokenUrl,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };
    const { data: tokenData } = await axios.post(tokenUrl, data, config);
    const { access_token: accessToken, token_type: tokenType } = tokenData;
    const cookiesOptions: CookieAttributes = {
      secure: true,
      sameSite: "strict",
    };

    Cookies.set(this.getAccessTokenCookieKey(), accessToken, cookiesOptions);
    Cookies.set(this.getTokenTypeCookieKey(), tokenType, cookiesOptions);
    // Redirect to the page where the user was before starting the log-in.
    window.location.href = window.localStorage.getItem(
      this.localStorageOriginKey,
    )!;
  }

  async getUserDetails(): Promise<UserDetails> {
    const userinfoUrl = `${this.baseURL}/openid-connect/userinfo`;
    const data = {
      headers: {
        Authorization: await this.getAuthorizationHeader(),
      },
    };
    const jwt = await axios.get(userinfoUrl, data);
    const jwtPayload = decodeJwt(jwt.data);

    return {
      username: `${jwtPayload.preferred_username ?? ""}`,
      name: `${jwtPayload.name ?? ""}`,
    };
  }

  async logout(): Promise<void> {
    const logoutUrl = `${this.baseURL}/openid-connect/logout`;
    const data = {
      headers: {
        Authorization: await this.getAuthorizationHeader(),
      },
    };

    try {
      await axios.post(logoutUrl, {}, data);
    } catch (e) {
      console.error("Failed to log out on the remote server", e);
    } finally {
      Cookies.remove(this.getTokenTypeCookieKey());
      Cookies.remove(this.getAccessTokenCookieKey());
    }
  }

  async getAuthorizationHeader(): Promise<string | undefined> {
    const isAuthenticated = await this.isAuthenticated();
    if (isAuthenticated) {
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

  private getAccessTokenCookieKey() {
    return `${this.accessTokenCookieKeyPrefix}-${this.baseURL}`;
  }

  private getTokenTypeCookieKey() {
    return `${this.tokenTypeCookieKeyPrefix}-${this.baseURL}`;
  }
}
