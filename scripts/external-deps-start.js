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

import {
  clearLocalPlatform,
  createLocalPlatform,
  getPlatformPackages,
  updateSingleLocalPlatform,
} from "./build-local-platform.js";
import { WORKSPACE_ROOT } from "./utils.js";
import { spawn, spawnSync } from "child_process";
import { readFileSync, watch, writeFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const NPMRC_PATH = resolve(WORKSPACE_ROOT, ".npmrc");
const REGISTRY_LINE_PATTERN = /^(\/\/)?(@xwiki:registry=.+)$/m;

function enableLocalRegistry() {
  const npmRcContent = readFileSync(NPMRC_PATH, "utf8");
  const match = npmRcContent.match(REGISTRY_LINE_PATTERN);

  // We found the commented line.
  if (match && match[1]) {
    writeFileSync(
      NPMRC_PATH,
      npmRcContent.replace(REGISTRY_LINE_PATTERN, "$2"),
      "utf8",
    );
    console.log('Enabled local "@xwiki" registry in .npmrc.');
  } else {
    console.error('Could not find local "@xwiki" registry URL in .npmrc.');
    process.exit(1);
  }
}

async function startNpmProxyServer() {
  return new Promise((resolve, reject) => {
    const server = spawn("pnpm", ["nx", "dev", "@xwiki/cristal-npm-server"], {
      cwd: WORKSPACE_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });

    server.stdout.on("data", (data) => {
      process.stdout.write("[npm-server] " + data);
      if (data.includes("Application is running on ")) {
        resolve(server);
      }
    });

    server.stderr.on("data", (data) => {
      process.stderr.write("[npm-server]" + data);
    });

    server.on("exit", (code) => {
      reject(new Error(`npm server exited unexpectedly with code ${code}.`));
    });
  });
}

async function registerPlatformChangeWatchers(xwikiPlatformRoot, timestamp) {
  const platformPackages = await getPlatformPackages(
    join(
      xwikiPlatformRoot,
      "xwiki-platform-core/xwiki-platform-node",
      "src/main/node",
    ),
  );

  for (const packageName of platformPackages.keys()) {
    // Skip root package.
    if (packageName == "@xwiki/platform-node") {
      continue;
    }

    let timeoutId;
    let watcher;

    async function callback() {
      // We use a timeout to debounce watch events.
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        // Temporarily disable watcher.
        watcher.close();

        // Rebuild and repack modified package.
        await updateSingleLocalPlatform(
          packageName,
          xwikiPlatformRoot,
          timestamp,
        );

        // Re-enable watcher.
        watcher = watch(
          platformPackages.get(packageName),
          { recursive: true },
          callback,
        );
      }, 100);
    }

    watcher = watch(
      platformPackages.get(packageName),
      { recursive: true },
      callback,
    );
  }
}

function cleanUp() {
  // Disable local registry.
  const npmRcContent = readFileSync(NPMRC_PATH, "utf8");
  const match = npmRcContent.match(REGISTRY_LINE_PATTERN);

  // We found the uncommented line.
  if (match && !match[1]) {
    writeFileSync(
      NPMRC_PATH,
      npmRcContent.replace(REGISTRY_LINE_PATTERN, "//$2"),
      "utf8",
    );
    console.log('Disabled local "@xwiki" registry in .npmrc.');
  }

  // Revert to public packages.
  spawnSync("pnpm", ["update", "-r", "--no-save", "@xwiki/platform-*"], {
    cwd: WORKSPACE_ROOT,
    stdio: "inherit",
  });
}

// eslint-disable-next-line max-statements
async function main() {
  if (process.argv.length < 4 || !["start", "dev"].includes(process.argv[3])) {
    console.error(
      `Missing parameter. Usage: ${process.argv[1]} <xwiki-platform-root> <start|dev>`,
    );
    return;
  }
  const xwikiPlatformRoot = process.argv[2];
  const pnpmRunCommand = process.argv[3];

  // Register cleanup operations on exit.
  process.on("SIGINT", () => {
    cleanUp();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    cleanUp();
    process.exit(0);
  });

  // Enable local "@xwiki" registry.
  enableLocalRegistry();

  // Build platform.
  const timestamp = Math.floor(Date.now() / 1000);
  await clearLocalPlatform();
  await createLocalPlatform(xwikiPlatformRoot, timestamp);

  // Start npm server.
  await startNpmProxyServer();

  // Use served packages.
  spawnSync("pnpm", ["update", "-r", "--no-save", "@xwiki/platform-*"], {
    cwd: WORKSPACE_ROOT,
    stdio: "inherit",
  });

  // Run vite server.
  if (pnpmRunCommand == "start") {
    spawn("pnpm", ["run", "start"], {
      cwd: WORKSPACE_ROOT,
      stdio: "inherit",
    });
  } else if (pnpmRunCommand == "dev") {
    // Watch changes in platform packages.
    await registerPlatformChangeWatchers(xwikiPlatformRoot, timestamp);

    spawn("pnpm", ["run", "dev"], {
      cwd: WORKSPACE_ROOT,
      stdio: "inherit",
      env: {
        ...process.env,
        PLATFORM_EXTERNAL_DEPS: "true",
      },
    });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    cleanUp();
    process.exit(1);
  });
}
