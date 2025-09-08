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

import { collaborationManagerName } from "./collaborationManagerName";
import { inject, injectable } from "inversify";
import type { CollaborationManager } from "./collaborationManager";
import type { CollaborationManagerProvider } from "./collaborationManagerProvider";
import type { CristalApp } from "@xwiki/cristal-api";

/**
 * @since 0.20
 * @beta
 */
@injectable()
export class DefaultCollaborationManagerProvider
  implements CollaborationManagerProvider
{
  constructor(@inject("CristalApp") private readonly cristalApp: CristalApp) {}

  get(): CollaborationManager {
    const hint = this.cristalApp.getWikiConfig().realtimeHint;
    const container = this.cristalApp.getContainer();
    if (hint && container.isBound(collaborationManagerName, { name: hint })) {
      return container.get(collaborationManagerName, { name: hint });
    } else {
      return container.get(collaborationManagerName);
    }
  }
}
