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

import type { UserDetails } from "./userDetails";

/**
 * Interface to implement for a given backend to allow users to authenticate.
 *
 * @since 0.11
 */
interface AuthenticationManager {
  /**
   * Starts the authentication process.
   * @since 0.15
   */
  start(): Promise<void>;

  /**
   * Handle the callback.
   */
  callback(): Promise<void>;

  /**
   * Returns the currently registered authorization header
   */
  getAuthorizationHeader(): Promise<string | undefined>;

  /**
   * @returns true of the current user is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Returns the user details for the current user.
   */
  getUserDetails(): Promise<UserDetails>;

  /**
   * Logs out the current user.
   */
  logout(): Promise<void>;

  /**
   * Optional method returning the currently connected user id.
   *
   * @returns the id of the currently connected user, or undefined if not authenticated
   * @since 0.20
   */
  getUserId?(): string | undefined;
}

export { type AuthenticationManager };
