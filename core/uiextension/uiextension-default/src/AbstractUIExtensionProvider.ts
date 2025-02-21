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

import { inject } from "inversify";
import type { CristalApp } from "@xwiki/cristal-api";
import type {
  UIExtension,
  UIExtensionProvider,
} from "@xwiki/cristal-uiextension-api";

/**
 * Abstract implementation for {@link UIExtensionProvider}.
 * Users are expected to override {@link getUIExtensionName}
 * to support a specific extension.
 *
 * @since 0.15
 */
export abstract class AbstractUIExtensionProvider
  implements UIExtensionProvider
{
  constructor(
    @inject<CristalApp>("CristalApp") readonly cristalApp: CristalApp,
  ) {}

  get(): UIExtension {
    const container = this.cristalApp.getContainer();
    const wikiConfigType = this.cristalApp.getWikiConfig().getType();
    if (container.isBoundNamed(this.getUIExtensionName(), wikiConfigType)) {
      return container.getNamed<UIExtension>(
        this.getUIExtensionName(),
        wikiConfigType,
      );
    } else {
      return container.get<UIExtension>(this.getUIExtensionName());
    }
  }

  abstract getUIExtensionName(): string;
}
