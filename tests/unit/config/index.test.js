import { describe, expect, test } from "@jest/globals";
import { configSchema } from "../../../src/config/schema.js";
import { defaultConfig } from "../../../src/config/default.js";
import { loadConfig } from "../../../src/config/loader.js";
import * as configIndex from "../../../src/config/index.js";

describe("config/index exports", () => {
    test("re-exports config modules", () => {
        expect(configIndex.defaultConfig).toBe(defaultConfig);
        expect(configIndex.configSchema).toBe(configSchema);
        expect(configIndex.loadConfig).toBe(loadConfig);
    });

    test("exports only expected keys", () => {
        expect(Object.keys(configIndex).sort()).toEqual([
            "configSchema",
            "defaultConfig",
            "loadConfig",
        ]);
    });
});
