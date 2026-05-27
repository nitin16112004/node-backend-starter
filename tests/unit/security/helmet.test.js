import { describe, expect, test } from "@jest/globals";
import createHelmetDefault, {
    createHelmet,
} from "../../../src/security/helmet.js";

describe("security/helmet", () => {
    test("throws on invalid options", () => {
        expect(() => createHelmet("invalid")).toThrow(TypeError);
        expect(() => createHelmet(123)).toThrow(TypeError);
    });

    test("returns middleware function", () => {
        const middleware = createHelmet();
        expect(typeof middleware).toBe("function");
    });

    test("accepts options object", () => {
        const middleware = createHelmet({ contentSecurityPolicy: false });
        expect(typeof middleware).toBe("function");
    });

    test("default export equals named export", () => {
        expect(createHelmetDefault).toBe(createHelmet);
    });
});
