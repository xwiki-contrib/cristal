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

import { readConfiguration } from "@xwiki/cristal-configuration-electron-main";
import { app, shell } from "electron";
import { URL } from "node:url";
import type { Session } from "electron";

/**
 * Union for all existing permissions in electron
 */
type Permission = Parameters<
  Exclude<Parameters<Session["setPermissionRequestHandler"]>[0], null>
>[1];

/**
 * A list of origins that you allow open INSIDE the application and permissions for them.
 *
 * In development mode, you need allow open `VITE_DEV_SERVER_URL`.
 * @deprecated the allowed origins and permissions should be derived from the configuration.
 */
const ALLOWED_ORIGINS_AND_PERMISSIONS: Map<string, Set<Permission>> = new Map<
  string,
  Set<Permission>
>(
  import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL
    ? [[new URL(import.meta.env.VITE_DEV_SERVER_URL).origin, new Set()]]
    : [],
);
// TODO: CRISTAL-253 replace this hardcoded mapping with list of values drawn
// from the configuration.
ALLOWED_ORIGINS_AND_PERMISSIONS.set("http://localhost:15680", new Set());

/**
 * A list of origins that you allow open IN BROWSER.
 * Navigation to the origins below is only possible if the link opens in a new window.
 *
 * @example
 * <a
 *   target="_blank"
 *   href="https://github.com/"
 * >
 */
const ALLOWED_EXTERNAL_ORIGINS = new Set<`https://${string}`>([
  "https://github.com",
]);

app.on("web-contents-created", (_, contents) => {
  /**
   * Block navigation to origins not on the allowlist.
   *
   * Navigation exploits are quite common. If an attacker can convince the app to navigate away from its current page,
   * they can possibly force the app to open arbitrary web resources/websites on the web.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
   */
  const configuration = readConfiguration();
  contents.on("will-navigate", (event, url) => {
    const { origin } = new URL(url);
    const isAllowedOrigin = Object.values(configuration).some(
      (configuration) => {
        const baseURL = configuration.baseURL;
        if (!baseURL) {
          return false;
        }
        return new URL(baseURL).origin == origin;
      },
    );

    if (isAllowedOrigin) {
      return;
    }

    // Prevent navigation
    event.preventDefault();

    if (import.meta.env.DEV) {
      console.warn(`Blocked navigating to disallowed origin: ${origin}`);
    }
  });

  /**
   * Block requests for disallowed permissions.
   * By default, Electron will automatically approve all permission requests.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#5-handle-session-permission-requests-from-remote-content
   */
  contents.session.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const { origin } = new URL(webContents.getURL());

      // FIXME: this control is currently based on a fixed set of URLs, but seems also unused. We need to check more
      // closely if this check is needed.
      const permissionGranted =
        !!ALLOWED_ORIGINS_AND_PERMISSIONS.get(origin)?.has(permission);
      callback(permissionGranted);

      if (!permissionGranted && import.meta.env.DEV) {
        console.warn(
          `${origin} requested permission for '${permission}', but was rejected.`,
        );
      }
    },
  );

  /**
   * Hyperlinks leading to allowed sites are opened in the default browser.
   *
   * The creation of new `webContents` is a common attack vector. Attackers attempt to convince the app to create new
   * windows, frames, or other renderer processes with more privileges than they had before; or with pages opened that
   * they couldn't open before. You should deny any unexpected window creation.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
   * @see https://www.electronjs.org/docs/latest/tutorial/security#15-do-not-use-openexternal-with-untrusted-content
   */
  contents.setWindowOpenHandler(({ url }) => {
    const { origin } = new URL(url);

    if (ALLOWED_EXTERNAL_ORIGINS.has(origin as `https://${string}`)) {
      // Open url in default browser.
      shell.openExternal(url).catch(console.error);
    } else if (import.meta.env.DEV) {
      console.warn(`Blocked the opening of a disallowed origin: ${origin}`);
    }

    // Prevent creating a new window.
    return { action: "deny" };
  });

  /**
   * Verify webview options before creation.
   *
   * Strip away preload scripts, disable Node.js integration, and ensure origins are on the allowlist.
   *
   * @see https://www.electronjs.org/docs/latest/tutorial/security#12-verify-webview-options-before-creation
   */
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    const { origin } = new URL(params.src);
    if (!ALLOWED_ORIGINS_AND_PERMISSIONS.has(origin)) {
      if (import.meta.env.DEV) {
        console.warn(
          `A webview tried to attach ${params.src}, but was blocked.`,
        );
      }

      event.preventDefault();
      return;
    }

    // Strip away preload scripts if unused or verify their location is legitimate.
    delete webPreferences.preload;
    // @ts-expect-error `preloadURL` exists. - @see https://www.electronjs.org/docs/latest/api/web-contents#event-will-attach-webview
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // Enable contextIsolation
    webPreferences.contextIsolation = true;
  });
});
