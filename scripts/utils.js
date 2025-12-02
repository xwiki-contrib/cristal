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
import { readdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Configuration
const WORKSPACE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

async function findWorkspacePackages(dir = WORKSPACE_ROOT, packages = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    // Skip node_modules and hidden directories
    if (entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      await findWorkspacePackages(fullPath, packages);
    } else if (entry.name === "package.json") {
      // Skip root package.json
      if (dirname(fullPath) !== WORKSPACE_ROOT) {
        packages.push(dirname(fullPath));
      }
    }
  }

  return packages;
}

export { WORKSPACE_ROOT, findWorkspacePackages };
