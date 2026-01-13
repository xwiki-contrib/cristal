/**
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

import { inject, injectable } from "inversify";
import type { HTTPHeadersProvider } from "../HTTPHeadersProvider";
import type { AuthenticationManagerProvider } from "@xwiki/platform-authentication-api";

/**
 * Provides HTTP headers to perform authenticated requests with Nextcloud's API.
 *
 * @since 0.25.0
 * @beta
 */
@injectable()
export class NextcloudAuthenticatedHTTPHeadersProvider implements HTTPHeadersProvider {
  constructor(
    @inject("AuthenticationManagerProvider")
    private readonly authenticationManagerProvider: AuthenticationManagerProvider,
  ) {}

  /**
   * Returns the HTTP headers for an authenticated Nextcloud user.
   *
   * @returns the HTTP headers
   */
  async getHeaders(): Promise<Headers> {
    const authorizationHeader = await this.authenticationManagerProvider
      .get()
      ?.getAuthorizationHeader();
    const headers: Headers = new Headers({
      "OCS-APIRequest": "true",
    });
    if (authorizationHeader) {
      headers.set("Authorization", authorizationHeader);
    }
    return headers;
  }
}
