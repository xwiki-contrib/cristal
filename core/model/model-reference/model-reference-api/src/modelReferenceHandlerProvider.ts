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

import { ModelReferenceHandler } from "./modelReferenceHandler";

/**
 * A ModelReferenceHandlerProvider returns the expected instance of
 * {@link ModelReferenceHandler}.
 *
 * @since 0.13
 */
interface ModelReferenceHandlerProvider {
  /**
   * Returns the instance of {@link ModelReferenceHandler} matching the
   * requested wiki configuration type, or the current one if empty.
   *
   * @param type - the wiki configuration type
   * @returns the instance of model reference handler
   */
  get(type?: string): ModelReferenceHandler | undefined;
}

export { type ModelReferenceHandlerProvider };
