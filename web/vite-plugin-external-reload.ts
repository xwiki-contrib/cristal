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

import { cpSync, readFileSync, readdirSync } from "fs";
import { basename, dirname, join, resolve } from "node:path";
import type { Plugin } from "vite";

export function externalReloadPlugin(): Plugin {
  const WORKSPACE_DIR = resolve(process.cwd(), "..");
  const LOCAL_PLATFORM = ".xwiki-platform";

  function replacePnpmPackage(packageName: string, packageDir: string) {
    const packageJson = JSON.parse(
      readFileSync(join(packageDir, "package.json"), "utf8"),
    );
  
    const version = packageJson.version;
    const pnpmPackageName = `${packageName.replace("/", "+")}@${version}`;
    const pnpmPackageDir =
      readdirSync(join(WORKSPACE_DIR, "node_modules/.pnpm")).find((dir) =>
        dir.startsWith(pnpmPackageName),
      );
  
    if (pnpmPackageDir) {
      const target = join(
        WORKSPACE_DIR,
        "node_modules/.pnpm",
        pnpmPackageDir,
        "node_modules",
        packageName
      );
      cpSync(packageDir, target, {
        recursive: true,
        filter: (file) => !file.endsWith(".tgz") && !file.endsWith(".updated"),
      });
    }
  }

  return {
    name: "external-reload",
    
    configureServer(server) {
      server.watcher.add(join(WORKSPACE_DIR, LOCAL_PLATFORM));
    },

    async handleHotUpdate({ server, file }) {
      if (file.includes(LOCAL_PLATFORM) && file.endsWith(".updated")) {
        const packageName = decodeURIComponent(basename(dirname(file)));

        replacePnpmPackage(packageName, dirname(file));
        setImmediate(() => server.restart());
      }
    },
  }
}
