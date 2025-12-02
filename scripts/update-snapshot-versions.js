#!/usr/bin/env node

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
import { WORKSPACE_ROOT, findWorkspacePackages } from "./utils.js";
import { rm } from "fs/promises";
import { join } from "path";

async function removeNodeModules(packageDir) {
  const nodeModulesPath = join(packageDir, "node_modules");

  try {
    await rm(nodeModulesPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    console.error(`Failed to remove ${nodeModulesPath}:`, error.message);
    return null;
  }
}

async function main() {
  const packages = await findWorkspacePackages();

  if (packages.length === 0) {
    console.log("No packages found");
    return;
  }

  const results = await Promise.all(
    packages.map((pkg) => removeNodeModules(pkg)),
  );

  const successful = results.filter((r) => r !== null);

  await rm(join(WORKSPACE_ROOT, "node_modules"), {
    recursive: true,
    force: true,
  });
  await rm(join(WORKSPACE_ROOT, "pnpm-lock.yaml"));

  if (successful.length === 0) {
    console.warn("No packages updated");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
