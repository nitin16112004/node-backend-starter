import { describe, expect, test } from "@jest/globals";
import defaultConfig, {
    defaultConfig as namedDefaultConfig,
} from "../../../src/config/default.js";

describe("config/default exports", () => {
    test("exports default config object", () => {
        expect(defaultConfig).toBe(namedDefaultConfig);
        expect(defaultConfig).toHaveProperty("env", "development");
        expect(Object.isFrozen(defaultConfig)).toBe(true);
        expect(Object.isFrozen(defaultConfig.app)).toBe(true);
        expect(Object.isFrozen(defaultConfig.auth.jwt)).toBe(true);
    });
});
