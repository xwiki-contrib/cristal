import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import dts from "vite-plugin-dts";

import { ModuleFormat } from "rollup";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function generateConfig(dir: string) {
  const pkg = JSON.parse(
    readFileSync(resolve(dir, "package.json"), { encoding: "utf-8" }),
  );

  return defineConfig({
    build: {
      lib: {
        entry: "./src/index.ts",
        name: "menubuttons",
        // the proper extensions will be added
        fileName: (format: ModuleFormat) => {
          if (format == "es") {
            return "main.bundle.dev.js";
          } else {
            return "main.bundle.js";
          }
        },
        formats: ["es", "iife"],
      },
      rollupOptions: {
        external: Object.keys(pkg.dependencies || {}),
      },
    },
    plugins: [
      // https://github.com/antfu/vite-plugin-inspect
      Inspect({
        // change this to enable inspect for debugging
        enabled: true,
      }),
      dts({
        insertTypesEntry: true,
      }),
    ],
  });
}
