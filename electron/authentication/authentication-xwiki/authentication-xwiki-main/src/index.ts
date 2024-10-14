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

import { BrowserWindow, ipcMain } from "electron";
import axios from "axios";
import {
  getAccessToken,
  getTokenType,
  setAccessToken,
  setTokenType,
  deleteAccessToken,
  deleteTokenType,
} from "./storage.js";
import { UserDetails } from "@xwiki/cristal-authentication-api";

const callbackUrl = "http://callback/";

// TODO: get from the config

const OIDC_URL = "http://localhost:15680/";

// TODO: maybe generate randomly, or ask for the user to pick one at start?
const clientId = "abcd";

async function getTokenFromCallbackCode(code: string) {
  const tokenUrl = `${OIDC_URL}xwiki/oidc/token`;
  const data = {
    grant_type: "authorization_code",
    code,
    redirect_uri: callbackUrl,
    client_id: clientId,
  };
  return axios.post(tokenUrl, data, {
    url: tokenUrl,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

function initAuth(win: BrowserWindow, reload: (win: BrowserWindow) => void) {
  win.webContents.session.webRequest.onBeforeRequest(
    {
      urls: [`${callbackUrl}*`],
    },
    async ({ url }, callback) => {
      if (url.startsWith(OIDC_URL)) {
        // Allow for the redirects from the oidc server to be performed without being blocked.
        callback({ cancel: false });
      } else {
        const parsedURL = new URL(url);
        const response = await getTokenFromCallbackCode(
          parsedURL.searchParams.get("code")!,
        );
        setTokenType(response.data.token_type);
        setAccessToken(response.data.access_token);
        mainWin.show();
        reload(mainWin);
        win?.close();
      }
    },
  );
}

async function createWindow(url: string) {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  await win.loadURL(url);

  return win;
}

let authWin: BrowserWindow;
let mainWin: BrowserWindow;

function getAuthorizationValue() {
  return `${getTokenType()} ${getAccessToken()}`;
}

export function load(
  browserWindow: BrowserWindow,
  reload: (win: BrowserWindow) => void,
): void {
  ipcMain.handle("authentication:xwiki:login", async () => {
    const authorizationUrl = new URL(`${OIDC_URL}xwiki/oidc/authorization`);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
    // Save the window asking for login (i.e., the main window), before creating
    // a new windows for the oidc web page. Then, hide the main window for the
    // duration of the authentication process.
    mainWin = browserWindow;
    authWin = await createWindow(authorizationUrl.toString());

    initAuth(authWin, reload);
    mainWin.hide();
  });

  ipcMain.handle("authentication:xwiki:isLoggedIn", () => {
    const tokenType = getTokenType();
    const accessTokenKey = getAccessToken();
    return tokenType && accessTokenKey;
  });

  ipcMain.handle(
    "authentication:xwiki:userDetails",
    async (event, { baseURL }: { baseURL: string }): Promise<UserDetails> => {
      const userinfoUrl = `${baseURL}/oidc/userinfo`;
      const data = {
        headers: {
          Authorization: getAuthorizationValue(),
        },
      };
      const {
        data: { profile, name },
      } = await axios.get(userinfoUrl, data);

      return { profile, name };
    },
  );
  ipcMain.handle("authentication:xwiki:authorizationValue", () => {
    return getAuthorizationValue();
  });
  ipcMain.handle("authentication:xwiki:logout", () => {
    deleteAccessToken();
    deleteTokenType();
  });
}
