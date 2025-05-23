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

import type { WikiConfig } from "@xwiki/cristal-api";
import type { Configurations } from "@xwiki/cristal-configuration-api";
import type { Ref } from "vue";

/**
 * Service that provides a reactive proxy to handle changes in available
 * WikiConfigs.
 *
 * @since 0.18
 */
interface WikiConfigProxy {
  getAvailableConfigurations(): Ref<Map<string, WikiConfig>>;
  setAvailableConfigurations(config: Configurations): void;
  deleteAvailableConfiguration(configName: string): void;
}

export type { WikiConfigProxy };
