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
 * Props of the select component.
 * @since 0.18
 */
type SelectProps = {
  /**
   * Label to display.
   */
  label: string;
  /**
   * List of items to select from.
   */
  items: Array<string>;
  /**
   * Help message.
   */
  help?: string;
  /**
   * Whether or not selecting an item from the list is mandatory.
   * Default: false.
   */
  required?: boolean;
  /**
   * The v-model value of the currently selected item.
   */
  modelValue?: string;
};

export type { SelectProps };
