import { beforeEach, describe, expect, test } from "@jest/globals";
import xssClean from "xss-clean";
import createXssCleanDefault, {
    createXssClean,
} from "../../../src/security/xss.js";

beforeEach(() => {
    xssClean.mockClear();
});

describe("security/xss", () => {
    test("throws on invalid options", () => {
        expect(() => createXssClean("invalid")).toThrow(TypeError);
        expect(() => createXssClean(123)).toThrow(TypeError);
    });

    test("passes options to xss-clean", () => {
        const middleware = createXssClean({ whiteList: {} });
        expect(typeof middleware).toBe("function");
        expect(xssClean).toHaveBeenCalledWith(expect.objectContaining({ whiteList: {} }));
    });

    test("returns middleware function with defaults", () => {
        const middleware = createXssClean();
        expect(typeof middleware).toBe("function");
        expect(xssClean).toHaveBeenCalledWith(expect.objectContaining({}));
    });

    test("default export equals named export", () => {
        expect(createXssCleanDefault).toBe(createXssClean);
    });
});
