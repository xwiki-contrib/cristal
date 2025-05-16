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

import type { Settings } from "./settings";

/**
 * A SettingsSerializer serializes an instance of settings into a JSON
 * representation. For specific implementations, it needs to be registered as
 * a named component, with the name being the "key" attribute of the Settings'
 * concrete type to handle.
 * @since 0.18
 */
interface SettingsSerializer {
  /**
   * Serializes a Settings instance into a JSON representation.
   * @param settings - the Settings instance.
   */
  serialize(settings: Settings): string;
}

/**
 * A SettingsSerializerProvider retrieves the best instance of
 * SettingsSerializer for a given Settings key.
 * @since 0.18
 */
interface SettingsSerializerProvider {
  /**
   * Returns the Serializer registered for the given type, or the default one if
   * not found or not specified.
   * @param type - the Settings type to match.
   */
  get(type?: string): SettingsSerializer;
}

export type { SettingsSerializer, SettingsSerializerProvider };
