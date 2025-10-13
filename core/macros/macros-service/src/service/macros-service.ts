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

import type {
  Macro,
  UntypedMacroParametersType,
} from "@xwiki/cristal-macros-api";

/**
 * Service handling the registration and delivery of macros
 *
 * @since 0.23
 * @beta
 */
export interface MacrosService {
  /**
   * Register a macro
   *
   * - Throws if a different macro with the same name already exists
   * - Ignores silently if a macro exists with the exact same object identity (`===` equality)
   *
   * @param macro - The macro to register
   */
  register<Params extends UntypedMacroParametersType>(
    macro: Macro<Params>,
  ): void;

  /**
   * List all registered macros
   *
   * @returns - All registered macros
   */
  list(): Macro<UntypedMacroParametersType>[];

  /**
   * Get a macro by its name
   *
   * @param name - The macro's name
   *
   * @returns - The registered macro with the provided name
   */
  get(name: string): Macro<UntypedMacroParametersType> | null;
}
