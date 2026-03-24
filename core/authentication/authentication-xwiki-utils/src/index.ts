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

import type { UserDetails } from "@xwiki/platform-authentication-api";

/**
 * Fetches user data from XWiki's user REST endpoint.
 *
 * @param userDetailsUrl - the URL to the REST endpoint to use
 * @param authorizationHeader - value for the Authorization header
 * @returns the fetched user details
 * @since 1.2.0-rc-1
 * @beta
 */
export async function fetchUserDetails(
  userDetailsUrl: string,
  authorizationHeader: string,
): Promise<UserDetails> {
  const response = await fetch(userDetailsUrl, {
    headers: {
      Accept: "application/json",
      Authorization: authorizationHeader,
    },
  });

  const json = await response.json();

  return {
    profile: json.xwikiAbsoluteUrl,
    username: json.id,
    name: json.displayName,
    avatar: json.avatarUrl,
  };
}
