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
import { _electron as electron } from "playwright";

// Launch Electron app.
const electronApp = await electron.launch({ args: [".."] });

// Evaluation expression in the Electron context.
const appPath = await electronApp.evaluate(async ({ app }) => {
  // This runs in the main Electron process, parameter here is always
  // the result of the require('electron') in the main app script.
  return app.getAppPath();
});
console.log("app path", appPath);

// Get the first window that the app opens, wait if necessary.
const window = await electronApp.firstWindow();

// Direct Electron console to Node terminal.
window.on("console", console.log);
// Click button.
const selected = await window.waitForSelector(".doc-title");
console.log("selected", await selected.textContent());
// Capture a screenshot.
await window.screenshot({ path: "intro.png" });
// Exit app.
await electronApp.close();
