import { describe, expect, test } from "@jest/globals";
import securityDefault, * as security from "../../../src/security/index.js";

describe("security/index exports", () => {
    test("exports middleware factories", () => {
        expect(typeof security.createRateLimiter).toBe("function");
        expect(typeof security.createHelmet).toBe("function");
        expect(typeof security.createCors).toBe("function");
        expect(typeof security.createCsrf).toBe("function");
        expect(typeof security.createXssClean).toBe("function");
        expect(typeof security.securityHeaders).toBe("function");
        expect(typeof security.ipFilter).toBe("function");
        expect(typeof security.requestSanitizer).toBe("function");

        expect(securityDefault).toEqual({
            createRateLimiter: security.createRateLimiter,
            createHelmet: security.createHelmet,
            createCors: security.createCors,
            createCsrf: security.createCsrf,
            createXssClean: security.createXssClean,
            securityHeaders: security.securityHeaders,
            ipFilter: security.ipFilter,
            requestSanitizer: security.requestSanitizer,
        });
        expect(Object.isFrozen(securityDefault)).toBe(true);
    });

    test("default export contains expected keys", () => {
        expect(Object.keys(securityDefault).sort()).toEqual([
            "createCors",
            "createCsrf",
            "createHelmet",
            "createRateLimiter",
            "createXssClean",
            "ipFilter",
            "requestSanitizer",
            "securityHeaders",
        ]);
    });
});
