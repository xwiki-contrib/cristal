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

const storedConfig: {
  storageRoot?: string;
} = {};

/**
 * Set the storage root location for the current configuration.
 * @param storageRoot - the new storage root location
 * @since 0.16
 */
function setStorageRoot(storageRoot?: string): void {
  storedConfig.storageRoot = storageRoot;
}

/**
 * Get the storage root location for the current configuration.
 * @returns the current storage root location
 * @since 0.16
 */
function getStorageRoot(): string | undefined {
  return storedConfig.storageRoot;
}

export { getStorageRoot, setStorageRoot };
