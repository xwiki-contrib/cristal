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
import { x } from "tar";
import { spawnSync } from "child_process";
import { lstat, mkdir, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { argv } from "process";

const localPlatformLocation = join(WORKSPACE_ROOT, ".xwiki-platform");

async function clearLocalPlatform() {
  try {
    const stats = await lstat(localPlatformLocation);
    if (stats.isDirectory()) {
      await rm(localPlatformLocation, { recursive: true });
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.info(`The folder ${localPlatformLocation} did not exist yet.`);
    } else {
      throw error;
    }
  }
}

// eslint-disable-next-line max-statements
async function createLocalPlatform(xwikiPlatformRoot) {
  const xwikiPlatformLocation = join(
    xwikiPlatformRoot,
    "xwiki-platform-core/xwiki-platform-node",
  );
  const platformPackages = await getPlatformPackages(
    join(xwikiPlatformLocation, "src/main/node"),
  );

  if (platformPackages.length === 0) {
    console.error("No platform packages found.");
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);

  console.info("Building platform packages...");
  spawnSync("mvn", ["clean", "install"], { cwd: xwikiPlatformLocation });

  // eslint-disable-next-line max-statements
  const promises = platformPackages.keys().map(async (packageName) => {
    console.info(`Packing local version of package ${packageName}...`);

    const destFolder = join(
      localPlatformLocation,
      encodeURIComponent(packageName),
    );

    const packageJsonPath = join(
      platformPackages.get(packageName),
      "package.json",
    );
    const oldPackageJson = await readFile(packageJsonPath);
    const packageJson = JSON.parse(oldPackageJson);

    if (packageJson.version.includes("SNAPSHOT")) {
      await mkdir(destFolder, { recursive: true });

      packageJson.version = packageJson.version.replace("SNAPSHOT", timestamp);

      if ("dependencies" in packageJson) {
        for (const dep in packageJson.dependencies) {
          if (platformPackages.has(dep)) {
            packageJson.dependencies[dep] = packageJson.version;
          }
        }
      }
      if ("devDependencies" in packageJson) {
        for (const dep in packageJson.devDependencies) {
          if (platformPackages.has(dep)) {
            packageJson.devDependencies[dep] = packageJson.version;
          }
        }
      }

      await writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + "\n",
      );
      spawnSync("pnpm", ["pack", "--out", `${destFolder}/package.tgz`], {
        cwd: platformPackages.get(packageName),
      });
      await writeFile(packageJsonPath, oldPackageJson);

      x({
        f: `${destFolder}/package.tgz`,
        C: destFolder,
        strip: 1,
      });
    } else {
      return;
    }
  });

  for (const promise of promises) {
    await promise;
  }
}

async function getPlatformPackages(xwikiPlatformLocation) {
  const platformPackagesDirs = await findWorkspacePackages(
    xwikiPlatformLocation,
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

async function main() {
  if (argv.length < 3) {
    console.error(`Missing parameter. Usage: ${argv[1]} <xwiki-platform-root>`);
    return;
  }

  const xwikiPlatformRoot = argv[2];

  await clearLocalPlatform();
  await createLocalPlatform(xwikiPlatformRoot);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
