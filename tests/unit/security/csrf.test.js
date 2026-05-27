import { beforeEach, describe, expect, test } from "@jest/globals";
import csurf from "csurf";
import createCsrfDefault, { createCsrf } from "../../../src/security/csrf.js";

beforeEach(() => {
    csurf.mockClear();
});

describe("security/csrf", () => {
    test("throws on invalid options", () => {
        expect(() => createCsrf("invalid")).toThrow(TypeError);
        expect(() => createCsrf(123)).toThrow(TypeError);
    });

    test("passes default cookie option", () => {
        const middleware = createCsrf();
        expect(typeof middleware).toBe("function");
        expect(csurf).toHaveBeenCalledWith(expect.objectContaining({ cookie: true }));
    });

    test("passes custom options to csurf", () => {
        const middleware = createCsrf({ cookie: false, value: "csrf-token" });
        expect(typeof middleware).toBe("function");
        expect(csurf).toHaveBeenCalledWith(
            expect.objectContaining({ cookie: false, value: "csrf-token" }),
        );
    });

    test("default export equals named export", () => {
        expect(createCsrfDefault).toBe(createCsrf);
    });
});
