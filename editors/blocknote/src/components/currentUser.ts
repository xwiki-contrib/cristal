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

import { AuthenticationManager } from "@xwiki/cristal-authentication-api";

/**
 *
 * @param authentication - an authentication manager components
 * @since 0.14
 */
export async function computeCurrentUser(
  authentication?: AuthenticationManager,
): Promise<{ name: string; color: string }> {
  let ret = {
    name: "Anonymous",
    // avatar: noavatar,
    color: "#000000",
  };
  if (authentication && (await authentication.isAuthenticated())) {
    try {
      const userDetails = await authentication.getUserDetails();
      ret = {
        name: userDetails.name,
        // avatar: userDetails.avatar ?? noavatar,
        color: "#000000",
      };
    } catch (e) {
      console.error("Failed to get the user details", e);
      ret = {
        name: "Unknown",
        // avatar: noavatar,
        color: "#000000",
      };
    }
  }

  return ret;
}
