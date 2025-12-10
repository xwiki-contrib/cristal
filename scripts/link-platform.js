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
import { readFile, writeFile } from "fs/promises";
import { join, relative } from "path";
import { argv } from "process";

const localPlatformLocation = join(
  WORKSPACE_ROOT,
  "node_modules/.pnpm/.xwiki-platform",
);

// eslint-disable-next-line max-statements
async function linkPackages(packageDir, platformPackages, packageName) {
  const packagePath = join(packageDir, "package.json");

  try {
    const content = await readFile(packagePath, "utf-8");
    const pkg = JSON.parse(content);

    // Skip if private or no name
    if (pkg.private && !pkg.name) {
      return null;
    }

    let found = false;
    const packagesToLink =
      packageName == "all" ? platformPackages.keys() : [packageName];
    packagesToLink.forEach((packageToLink) => {
      if ("dependencies" in pkg && packageToLink in pkg.dependencies) {
        pkg.dependencies[packageToLink] =
          `link:${platformPackages.get(packageToLink)}`;
        found = true;
      }

      if ("devDependencies" in pkg && packageToLink in pkg.devDependencies) {
        pkg.devDependencies[packageToLink] =
          `link:${platformPackages.get(packageToLink)}`;
        found = true;
      }
    });

    if (found) {
      await writeFile(packagePath, JSON.stringify(pkg, null, 2) + "\n");
    }

    return found;
  } catch (error) {
    const relativePath = relative(WORKSPACE_ROOT, packageDir);
    console.error(`Failed to update ${relativePath}:`, error.message);
    return null;
  }
}

async function getLocalPlatformPackages() {
  const platformPackagesDirs = await findWorkspacePackages(
    localPlatformLocation,
  );

  const platformPackages = new Map();
  await Promise.all(
    platformPackagesDirs.map(async (packageDir) => {
      const packagePath = join(packageDir, "package.json");

      const content = await readFile(packagePath, "utf-8");
      const pkg = JSON.parse(content);

      // Skip if private or no name
      if (pkg.private && !pkg.name) {
        return null;
      }

      platformPackages.set(pkg.name, packageDir);
    }),
  );

  return platformPackages;
}

// eslint-disable-next-line max-statements
async function main() {
  if (argv.length < 3) {
    console.error(
      `Missing parameter. Usage: ${argv[1]} <package-name | 'all'>`,
    );
    return;
  }

  const packageName = argv[2];

  const packages = await findWorkspacePackages();
  const platformPackages = await getLocalPlatformPackages();

  if (packages.length === 0) {
    console.error("No cristal packages found.");
    return;
  }

  if (platformPackages.length === 0) {
    console.error("No platform packages found.");
    return;
  }

  if (packageName != "all" && !platformPackages.has(packageName)) {
    console.error(`Package ${packageName} not found in ./.xwiki-platform.`);
    return;
  }

  const results = await Promise.all(
    packages.map((pkg) => linkPackages(pkg, platformPackages, packageName)),
  );

  const successful = results.filter((r) => r);

  if (successful.length === 0) {
    console.warn("No packages updated.");
  } else if (successful.length === 1) {
    console.info("1 package updated.");
  } else {
    console.info(`${successful.length} packages updated.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
