import { describe, expect, test } from "@jest/globals";
import createCorsDefault, { createCors } from "../../../src/security/cors.js";

describe("security/cors", () => {
    test("throws on invalid options", () => {
        expect(() => createCors("invalid")).toThrow(TypeError);
        expect(() => createCors(123)).toThrow(TypeError);
    });

    test("returns middleware function", () => {
        const middleware = createCors();
        expect(typeof middleware).toBe("function");
    });

    test("accepts options object", () => {
        const middleware = createCors({ origin: ["https://example.com"] });
        expect(typeof middleware).toBe("function");
    });

    test("default export equals named export", () => {
        expect(createCorsDefault).toBe(createCors);
    });
});
