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

// @ts-expect-error any type
import { WORKSPACE_ROOT, findWorkspacePackages } from "../../scripts/utils.js";
import express from "express";
import { createHash } from "crypto";
import { lstat, readFile } from "fs/promises";
import { join } from "path";
import type { Request, Response } from "express";

const NEXUS_REGISTRY = "https://nexus-snapshots.xwiki.org/repository/npm/";
const app = express();
const localPlatformLocation = join(WORKSPACE_ROOT, ".xwiki-platform");

let port = 15683;
const env_port = parseInt(process.env.AUTH_HTTP_PORT || "");
if (!isNaN(env_port) && env_port > 0) {
  port = env_port;
}

async function getPlatformPackages() {
  const platformPackages = new Map();

  try {
    const stats = await lstat(localPlatformLocation);
    if (stats.isDirectory()) {
      const platformPackagesDirs = await findWorkspacePackages(
        localPlatformLocation,
      );

      await Promise.all(
        platformPackagesDirs.map(async (packageDir: string) => {
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
    }
  } catch (error) {
    if ((error as { code: string })?.code === "ENOENT") {
      console.warn(`The folder ${localPlatformLocation} does not exist.`);
    } else {
      throw error;
    }
  }

  return platformPackages;
}

app.get("/package/:packageId", async (req: Request, res: Response) => {
  const platformPackages = await getPlatformPackages();
  if (
    "packageId" in req.params &&
    platformPackages.has(req.params["packageId"])
  ) {
    const packedContent = await readFile(
      join(platformPackages.get(req.params["packageId"]), "package.tgz"),
    );
    res.send(packedContent);
  } else {
    res.status(404);
  }
});

// eslint-disable-next-line max-statements
app.get("/metadata/:packageId", async (req: Request, res: Response) => {
  if ("packageId" in req.params) {
    const platformPackages = await getPlatformPackages();
    if (platformPackages.has(req.params["packageId"])) {
      const packageDir = platformPackages.get(req.params["packageId"]);
      const packagePath = join(packageDir, "package.json");
      const content = await readFile(packagePath, "utf-8");
      const pkg = JSON.parse(content);

      const shaHashStream = createHash("sha512");
      const packedContent = await readFile(join(packageDir, "package.tgz"));
      shaHashStream.update(packedContent);
      const sha = shaHashStream.digest("base64");

      const result = {
        _id: req.params["packageId"],
        "dist-tags": {
          latest: pkg.version,
        },
        name: req.params["packageId"],
        versions: {
          [pkg.version]: {
            ...pkg,
            dist: {
              integrity: `sha512-${sha}`,
              tarball: `http://localhost:${port}/package/${encodeURIComponent(req.params["packageId"])}`,
            },
          },
        },
      };
      res.json(result);
    } else {
      console.warn(
        `Package ${req.params["packageId"]} not found locally, redirecting...`,
      );
      res.redirect(
        `${NEXUS_REGISTRY}${encodeURIComponent(req.params["packageId"])}`,
      );
    }
  } else {
    res.status(404);
  }
});

app.listen(port, () => {
  console.log(`Application is running on http://localhost:${port}`);
});
