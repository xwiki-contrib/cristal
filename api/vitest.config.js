"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const vitest_config_1 = __importDefault(require("@cristal/dev-config/vitest.config"));
const vite_config_1 = __importDefault(require("./vite.config"));
exports.default = (0, config_1.mergeConfig)(vitest_config_1.default, vite_config_1.default);
