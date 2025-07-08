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

import { collaborationProviderName } from "./index";
import { inject, injectable } from "inversify";
import type { CollaborationProvider } from "./collaborationProvider";
import type { CollaborationProviderProvider } from "./collaborationProviderProvider";
import type { CristalApp } from "@xwiki/cristal-api";

@injectable()
export class DefaultCollaborationProviderProvider
  implements CollaborationProviderProvider
{
  constructor(@inject("CristalApp") private readonly cristalApp: CristalApp) {}

  get(): Promise<CollaborationProvider> {
    const type = this.cristalApp.getWikiConfig().getType();
    const container = this.cristalApp.getContainer();
    if (container.isBound(collaborationProviderName, { name: type })) {
      return container.get(collaborationProviderName, { name: type });
    } else {
      return container.get(collaborationProviderName);
    }
  }
}
