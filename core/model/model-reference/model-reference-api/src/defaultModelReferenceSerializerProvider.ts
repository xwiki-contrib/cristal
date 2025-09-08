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
import type { ModelReferenceSerializer } from "./modelReferenceSerializer";
import type { ModelReferenceSerializerProvider } from "./modelReferenceSerializerProvider";
import type { CristalApp } from "@xwiki/cristal-api";

/**
 * @since 0.12
 * @beta
 */
@injectable()
class DefaultModelReferenceSerializerProvider
  implements ModelReferenceSerializerProvider
{
  constructor(@inject("CristalApp") private readonly cristalApp: CristalApp) {}

  get(type?: string): ModelReferenceSerializer | undefined {
    const resolvedType = type || this.cristalApp.getWikiConfig().getType();
    try {
      return this.cristalApp
        .getContainer()
        .get("ModelReferenceSerializer", { name: resolvedType });
    } catch (e) {
      this.cristalApp
        .getLogger("model-reference.api")
        .warn(
          `Couldn't resolve ModelReferenceSerializer for type=[${resolvedType}]`,
          e,
        );
      return undefined;
    }
  }
}

export { DefaultModelReferenceSerializerProvider };
