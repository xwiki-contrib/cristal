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

import { MenuEntryButton1 } from "./menuEntryButton1";
import type { MenuEntry } from "../api/menuEntry";
import type { Logger } from "@xwiki/cristal-api";
import type { Container } from "inversify";

export class ComponentInit {
  logger: Logger;

  constructor(container: Container) {
    this.logger = container.get<Logger>("Logger");
    this.logger.setModule("menubuttons.components.componentsInit");

    this.logger?.debug("Init MenuButtons components begin");
    container.bind<MenuEntry>("MenuEntry").to(MenuEntryButton1);

    this.logger?.debug("Init MenuButtons components end");
  }
}
