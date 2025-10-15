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

import { injectable, multiInject } from "inversify";
import type { MacrosService } from "./macros-service";
import type { MacroWithUnknownShape } from "@xwiki/cristal-macros-api";

@injectable()
export class DefaultMacrosService implements MacrosService {
  private readonly macrosById: Map<string, MacroWithUnknownShape>;

  constructor(
    @multiInject("Macro")
    private readonly macros: MacroWithUnknownShape[],
  ) {
    this.macrosById = new Map(macros.map((macro) => [macro.infos.id, macro]));
  }

  list(): MacroWithUnknownShape[] {
    return [...this.macros];
  }

  get(name: string): MacroWithUnknownShape | null {
    return this.macrosById.get(name) ?? null;
  }
}
