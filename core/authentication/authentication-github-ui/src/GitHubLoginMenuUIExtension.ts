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
import type {
  AuthenticationManager,
  AuthenticationManagerProvider,
} from "@xwiki/cristal-authentication-api";
import type { UIExtension } from "@xwiki/cristal-uiextension-api";
import type { Component } from "vue";

/**
 * Login {@link UIExtension} for the GitHub backend.
 *
 * @since 0.15
 * @beta
 */
@injectable()
export class GitHubLoginMenuUIExtension implements UIExtension {
  id = "sidebar.actions.githubLoginMenu";
  uixpName = "sidebar.actions";
  order = 2100;
  parameters = {};

  constructor(
    @inject("AuthenticationManagerProvider")
    private authenticationManager: AuthenticationManagerProvider,
  ) {}

  async component(): Promise<Component> {
    return (await import("./vue/GitHubLoginMenu.vue")).default;
  }

  async enabled(): Promise<boolean> {
    const authenticationManager: AuthenticationManager =
      this.authenticationManager.get()!;
    const authenticated: boolean =
      await authenticationManager?.isAuthenticated();
    return !authenticated;
  }
}
