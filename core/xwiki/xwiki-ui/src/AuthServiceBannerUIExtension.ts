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
import type { CristalApp } from "@xwiki/cristal-api";
import type { AuthenticationManagerProvider } from "@xwiki/cristal-authentication-api";
import type { UIExtension } from "@xwiki/cristal-uiextension-api";
import type { Component } from "vue";

/**
 * Banner to notify of improper XWiki instance configuration for Cristal auth.
 *
 * @since 0.24-rc-1
 * @beta
 */
@injectable()
export class AuthServiceBannerUIExtension implements UIExtension {
  id = "banner.authServiceBanner";
  uixpName = "banner";
  order = 1000;
  parameters = {};

  constructor(
    @inject("AuthenticationManagerProvider")
    private readonly authenticationManager: AuthenticationManagerProvider,
    @inject("CristalApp") private readonly cristal: CristalApp,
  ) {}

  async component(): Promise<Component> {
    return (await import("./vue/AuthServiceBanner.vue")).default;
  }

  async enabled(): Promise<boolean> {
    if (await this.authenticationManager.get()?.isAuthenticated()) {
      // We check that the current authantication service can be fetched,
      // and we display the banner if it is not "oidc-provider-bridge".
      return await fetch(
        `${this.cristal.getWikiConfig().baseURL}/rest/cristal/auth`,
      ).then(async (response) => {
        return response.ok && (await response.text()) != "oidc-provider-bridge";
      });
    } else {
      return false;
    }
  }
}
