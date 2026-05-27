import { describe, expect, test } from "@jest/globals";
import pluginsDefault, {
    PluginSystem,
    createPluginSystem,
} from "../../../src/plugins/index.js";

describe("plugins/index exports", () => {
    test("exports factory and PluginSystem", () => {
        expect(typeof createPluginSystem).toBe("function");
        expect(createPluginSystem()).toBeInstanceOf(PluginSystem);
        expect(pluginsDefault).toEqual({ createPluginSystem, PluginSystem });
        expect(Object.isFrozen(pluginsDefault)).toBe(true);
    });
});
