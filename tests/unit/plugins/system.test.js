import { describe, expect, test } from "@jest/globals";
import PluginSystemDefault, {
    PluginSystem,
} from "../../../src/plugins/system.js";

describe("PluginSystem", () => {
    test("registers plugins and executes them in order", async () => {
        const system = new PluginSystem();
        const calls = [];

        system.register(
            "second",
            async (context) => {
                calls.push("second");
                context.second = true;
            },
            { order: 2 },
        );
        system.register(
            "first",
            async (context) => {
                calls.push("first");
                context.first = true;
            },
            { order: 1 },
        );

        const context = await system.execute({ base: true });

        expect(calls).toEqual(["first", "second"]);
        expect(context).toEqual({ base: true, first: true, second: true });
    });

    test("throws on invalid registration", () => {
        const system = new PluginSystem();
        expect(() => system.register("", () => { })).toThrow(TypeError);
        expect(() => system.register("name", "bad")).toThrow(TypeError);
    });

    test("prevents duplicate plugins", () => {
        const system = new PluginSystem();
        system.register("one", () => { });
        expect(() => system.register("one", () => { })).toThrow(
            'Plugin "one" is already registered',
        );
    });

    test("tracks metadata", () => {
        const system = new PluginSystem();
        system.register("meta", () => { }, { order: 5, meta: { flag: true } });
        const list = system.list();
        expect(list[0]).toMatchObject({
            name: "meta",
            order: 5,
            meta: { flag: true },
        });
    });

    test("clears plugins", () => {
        const system = new PluginSystem();
        system.register("one", () => { });
        system.clear();
        expect(system.list()).toEqual([]);
    });

    test("throws on invalid context", async () => {
        const system = new PluginSystem();
        await expect(system.execute(null)).rejects.toThrow(TypeError);
    });

    test("default export equals PluginSystem", () => {
        expect(PluginSystemDefault).toBe(PluginSystem);
    });
});
