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

import { externalReloadPlugin } from "./vite-plugin-external-reload";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import type { UserConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  // We only want platform hot-reload in dev mode.
  const enablePlatformHotReload =
    command === "serve" && mode === "development"
    && process.env.PLATFORM_EXTERNAL_DEPS === "true";

  const config: UserConfig = {
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html")
        },
      },
    },
    plugins: [
      Vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith("sl-")
          }
        }
      }),
    ],
    worker: {
      format: "es"
    },
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
  };

  if (enablePlatformHotReload) {
    config.optimizeDeps = {
      force: true,
    },
    config.plugins!.push(externalReloadPlugin());
  }

  return config;
});
