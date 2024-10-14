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
} from "./storage.js";

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

function initAuth(win: BrowserWindow) {
  console.log("INIT AUTH");
  win.webContents.session.webRequest.onBeforeRequest(
    {
      urls: [`${callbackUrl}*`],
    },
    async ({ url }, callback) => {
      console.log(">>>>> CALLBACK", url);
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
        win.close();
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

  win.webContents.openDevTools();

  await win.loadURL(url);

  return win;
}

let authWin: BrowserWindow;
let mainWin: BrowserWindow; // TODO: find out how to give access to the main window!

export function load(): void {
  ipcMain.handle("authentication:xwiki:login", async () => {
    const authorizationUrl = new URL(`${OIDC_URL}xwiki/oidc/authorization`);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
    // Save the window asking for login (i.e., the main window), before creating
    // a new windows for the oidc web page. Then, hide the main window for the
    // duration of the authentication process.
    mainWin = BrowserWindow.getFocusedWindow()!;
    authWin = await createWindow(authorizationUrl.toString());

    initAuth(authWin);
    // mainWin.hide();
    mainWin.close();
  });

  ipcMain.handle("authentication:xwiki:isLoggedIn", () => {
    const tokenType = getTokenType();
    const accessTokenKey = getAccessToken();
    return tokenType && accessTokenKey;
  });
}
