import { mergeConfig } from "vitest/config";
import defaultConfig from "@cristal/dev-config/vitest.config";
import localConfig from "./vite.config";

export default mergeConfig(defaultConfig, localConfig);
