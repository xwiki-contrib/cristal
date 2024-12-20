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

import { EntityReference, EntityType } from "@xwiki/cristal-model-api";

/**
 * @since 0.12
 */
interface ModelReferenceParser {
  /**
   * @param reference - an entity reference
   * @param type - (since 0.13) an optional type, helping to remove ambiguity when parsing the reference
   */
  parse(reference: string, type?: EntityType): EntityReference;
}
export type { ModelReferenceParser };
