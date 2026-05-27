import { describe, expect, jest, test } from "@jest/globals";
import helpers, {
    deepClone,
    deepFreeze,
    deepMerge,
    helpers as helpersNamed,
    isObject,
    omit,
    pick,
    safeJSONParse,
    sleep,
} from "../../../src/utils/helpers.js";

describe("utils/helpers exports", () => {
    test("exports expected functions and default helpers object", () => {
        expect(typeof isObject).toBe("function");
        expect(typeof deepFreeze).toBe("function");
        expect(typeof deepClone).toBe("function");
        expect(typeof deepMerge).toBe("function");
        expect(typeof pick).toBe("function");
        expect(typeof omit).toBe("function");
        expect(typeof sleep).toBe("function");
        expect(typeof safeJSONParse).toBe("function");

        expect(helpers).toBe(helpersNamed);
        expect(Object.isFrozen(helpers)).toBe(true);
        expect(Object.keys(helpers)).toEqual(
            expect.arrayContaining([
                "isObject",
                "deepFreeze",
                "deepClone",
                "deepMerge",
                "pick",
                "omit",
                "sleep",
                "safeJSONParse",
            ]),
        );
    });
});

describe("isObject", () => {
    test("returns true for plain objects", () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ a: 1 })).toBe(true);
    });

    test("returns false for arrays, null, and primitives", () => {
        expect(isObject([])).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject("value")).toBe(false);
        expect(isObject(42)).toBe(false);
        expect(isObject(() => { })).toBe(false);
    });
});

describe("deepFreeze", () => {
    test("freezes nested objects and arrays", () => {
        const input = { a: { b: 1 }, list: [{ c: 2 }] };
        const frozen = deepFreeze(input);

        expect(frozen).toBe(input);
        expect(Object.isFrozen(frozen)).toBe(true);
        expect(Object.isFrozen(frozen.a)).toBe(true);
        expect(Object.isFrozen(frozen.list)).toBe(true);
        expect(Object.isFrozen(frozen.list[0])).toBe(true);
    });

    test("leaves primitives unchanged", () => {
        expect(deepFreeze(5)).toBe(5);
        expect(deepFreeze("value")).toBe("value");
    });

    test("prevents mutation on frozen objects", () => {
        const frozen = deepFreeze({ name: "kit" });
        expect(() => {
            frozen.name = "changed";
        }).toThrow(TypeError);
    });
});

describe("deepClone", () => {
    test("deep clones objects and arrays without mutation", () => {
        const input = { nested: { value: 1 }, items: [{ id: 1 }] };
        const cloned = deepClone(input);

        expect(cloned).not.toBe(input);
        expect(cloned).toEqual(input);
        expect(cloned.nested).not.toBe(input.nested);
        expect(cloned.items).not.toBe(input.items);
        expect(cloned.items[0]).not.toBe(input.items[0]);
    });

    test("deep clones Date instances", () => {
        const date = new Date();
        const cloned = deepClone(date);
        expect(cloned).not.toBe(date);
        expect(cloned.getTime()).toBe(date.getTime());
    });

    test("deep clones Map and Set instances", () => {
        const map = new Map([
            ["key", { value: 1 }],
            ["another", { value: 2 }],
        ]);
        const set = new Set([{ value: 1 }, { value: 2 }]);

        const clonedMap = deepClone(map);
        const clonedSet = deepClone(set);

        expect(clonedMap).not.toBe(map);
        expect(clonedMap instanceof Map).toBe(true);
        expect(clonedMap.get("key")).toEqual({ value: 1 });
        expect(clonedMap.get("key")).not.toBe(map.get("key"));

        expect(clonedSet).not.toBe(set);
        expect(clonedSet instanceof Set).toBe(true);
        const values = Array.from(clonedSet.values());
        expect(values).toEqual([{ value: 1 }, { value: 2 }]);
    });

    test("handles circular references", () => {
        const input = {};
        input.self = input;

        const cloned = deepClone(input);
        expect(cloned).not.toBe(input);
        expect(cloned.self).toBe(cloned);
    });
});

describe("deepMerge", () => {
    test("merges nested objects and replaces arrays", () => {
        const first = { a: 1, nested: { x: 1 }, list: [1, 2] };
        const second = { b: 2, nested: { y: 2 }, list: [3] };

        const merged = deepMerge(first, second);
        expect(merged).toEqual({ a: 1, b: 2, nested: { x: 1, y: 2 }, list: [3] });
        expect(first).toEqual({ a: 1, nested: { x: 1 }, list: [1, 2] });
        expect(second).toEqual({ b: 2, nested: { y: 2 }, list: [3] });
    });

    test("skips null and undefined sources", () => {
        expect(deepMerge({ a: 1 }, null, undefined, { b: 2 })).toEqual({
            a: 1,
            b: 2,
        });
    });

    test("returns empty object when no sources are provided", () => {
        expect(deepMerge()).toEqual({});
    });

    test("returns primitive sources when they appear later in the chain", () => {
        expect(deepMerge({ a: 1 }, "final")).toBe("final");
        expect(deepMerge({ a: 1 }, [1, 2])).toEqual([1, 2]);
    });
});

describe("pick", () => {
    test("returns only requested keys", () => {
        const input = { a: 1, b: 2 };
        expect(pick(input, ["b", "c"])).toEqual({ b: 2 });
    });

    test("returns empty object for invalid inputs", () => {
        expect(pick(null, ["a"])).toEqual({});
        expect(pick({ a: 1 }, "a")).toEqual({});
    });
});

describe("omit", () => {
    test("omits provided keys", () => {
        const input = { a: 1, b: 2, c: 3 };
        expect(omit(input, ["b", "c"])).toEqual({ a: 1 });
    });

    test("returns full object when keys are invalid", () => {
        const input = { a: 1 };
        expect(omit(input, null)).toEqual({ a: 1 });
    });

    test("returns empty object for invalid source", () => {
        expect(omit(null, ["a"])).toEqual({});
    });
});

describe("sleep", () => {
    test("resolves after the given delay", async () => {
        jest.useFakeTimers();
        const promise = sleep(25);
        jest.advanceTimersByTime(25);
        await expect(promise).resolves.toBeUndefined();
        jest.useRealTimers();
    });

    test("accepts numeric strings", async () => {
        jest.useFakeTimers();
        const promise = sleep("10");
        jest.advanceTimersByTime(10);
        await expect(promise).resolves.toBeUndefined();
        jest.useRealTimers();
    });

    test("rejects invalid delays", async () => {
        await expect(sleep(-1)).rejects.toThrow(TypeError);
        await expect(sleep(Number.NaN)).rejects.toThrow(TypeError);
    });
});

describe("safeJSONParse", () => {
    test("parses valid JSON strings", () => {
        expect(safeJSONParse('{"a":1}', {})).toEqual({ a: 1 });
    });

    test("returns fallback on invalid JSON", () => {
        expect(safeJSONParse("{bad}", { ok: false })).toEqual({ ok: false });
    });

    test("returns fallback for non-string inputs", () => {
        expect(safeJSONParse(5, { ok: true })).toEqual({ ok: true });
    });

    test("defaults to null fallback", () => {
        expect(safeJSONParse("{bad}")).toBeNull();
    });
});
