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
import { link, lstat, mkdir, readFile, readdir, rm } from "fs/promises";
import { join } from "path";
import { argv } from "process";

const filesToLink = [
  "package.json",
  "vite.config.ts",
  "tsconfig.json",
  "tsdoc.json",
  "eslint.config.ts",
];

const localPlatformLocation = join(
  WORKSPACE_ROOT,
  "node_modules/.pnpm/.xwiki-platform",
);

// eslint-disable-next-line max-statements
async function linkRecursively(srcDir, destDir) {
  let srcExists = false;
  try {
    await lstat(srcDir);
    srcExists = true;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  if (srcExists) {
    await mkdir(destDir);
    for (const file of await readdir(srcDir)) {
      const stats = await lstat(join(srcDir, file));
      if (stats.isDirectory()) {
        await linkRecursively(join(srcDir, file), join(destDir, file));
      } else {
        await link(join(srcDir, file), join(destDir, file));
      }
    }
  }
}

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

async function createLocalPlatform(xwikiPlatformLocation) {
  const platformPackages = await getPlatformPackages(xwikiPlatformLocation);

  if (platformPackages.length === 0) {
    console.error("No platform packages found.");
    return;
  }

  // eslint-disable-next-line max-statements
  const promises = platformPackages.keys().map(async (packageName) => {
    console.info(`Creating local version of package ${packageName}...`);

    const destFolder = join(
      localPlatformLocation,
      encodeURIComponent(packageName),
    );
    await mkdir(destFolder, { recursive: true });
    console.log(`Created folder ${destFolder}.`);

    for (const fileToLink of filesToLink) {
      const src = join(platformPackages.get(packageName), fileToLink);
      const dest = join(destFolder, fileToLink);

      try {
        await lstat(src);
        await link(src, dest);
        console.log(`Linked ${dest}.`);
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }

    console.log("Linking sources...");
    await linkRecursively(
      join(platformPackages.get(packageName), "src"),
      join(destFolder, "src"),
    );

    console.log("Linking dist...");
    await linkRecursively(
      join(platformPackages.get(packageName), "dist"),
      join(destFolder, "dist"),
    );
  });

  for (const promise of promises) {
    await promise;
  }
}

async function getPlatformPackages(xwikiPlatformLocation) {
  const platformPackagesDirs = await findWorkspacePackages(
    join(
      xwikiPlatformLocation,
      "xwiki-platform-core/xwiki-platform-node/src/main/node",
    ),
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
    console.error(
      `Missing parameter. Usage: ${argv[1]} <xwiki-platform-location>`,
    );
    return;
  }

  const xwikiPlatformLocation = argv[2];

  await clearLocalPlatform();
  await createLocalPlatform(xwikiPlatformLocation);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
