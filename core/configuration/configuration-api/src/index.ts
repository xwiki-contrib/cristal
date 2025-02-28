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

/**
 * A single configuration entry.
 *
 * @since 0.14
 */
type Configuration = {
  configType: string;
} & ConfigurationOptions;

type ConfigurationOptions = {
  name: string;

  /** The base url of the backend endpoint */
  baseURL: string;

  /** The rest base url of the backend endpoint */
  baseRestURL: string;

  /**
   * Realtime endpoint URL.
   * Defaults to http://localhost:15681/collaboration when undefined.
   * @since 0.11
   */
  realtimeURL?: string;

  /**
   * Authentication server base URL.
   * @since 0.15
   */

  authenticationBaseURL?: string;
  homePage: string;
  serverRendering: boolean;
  designSystem: string;
  offline: boolean;

  /**
   * @since 0.16
   */
  editor: string;
};

/**
 * The set of available configurations.
 *
 * @since 0.14
 */
type Configurations = { [key: string]: Configuration };

/**
 * Signature of the configuration loader.
 *
 * @since 0.14
 */
type ConfigurationLoader = () => Promise<Configurations>;

export type {
  Configuration,
  ConfigurationLoader,
  ConfigurationOptions,
  Configurations,
};
