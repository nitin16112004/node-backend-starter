import { describe, expect, jest, test } from "@jest/globals";
import securityHeadersDefault, {
    securityHeaders,
} from "../../../src/security/headers.js";

const buildRes = () => ({
    setHeader: jest.fn(),
});

describe("security/headers", () => {
    test("applies default headers", () => {
        const middleware = securityHeaders();
        const res = buildRes();
        const next = jest.fn();

        middleware({}, res, next);

        expect(res.setHeader).toHaveBeenCalledWith(
            "X-Content-Type-Options",
            "nosniff",
        );
        expect(res.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
        expect(res.setHeader).toHaveBeenCalledWith("Referrer-Policy", "no-referrer");
        expect(res.setHeader).toHaveBeenCalledWith(
            "Permissions-Policy",
            "geolocation=(), microphone=(), camera=()",
        );
        expect(res.setHeader).toHaveBeenCalledWith(
            "Cross-Origin-Opener-Policy",
            "same-origin",
        );
        expect(res.setHeader).toHaveBeenCalledWith(
            "Cross-Origin-Resource-Policy",
            "same-origin",
        );
        expect(res.setHeader).toHaveBeenCalledWith("X-XSS-Protection", "0");
        expect(next).toHaveBeenCalled();
    });

    test("merges custom headers and skips empty values", () => {
        const middleware = securityHeaders({
            headers: {
                "X-Frame-Options": "SAMEORIGIN",
                "X-Custom": "custom-value",
                Empty: "   ",
            },
        });
        const res = buildRes();
        const next = jest.fn();

        middleware({}, res, next);

        expect(res.setHeader).toHaveBeenCalledWith(
            "X-Frame-Options",
            "SAMEORIGIN",
        );
        expect(res.setHeader).toHaveBeenCalledWith("X-Custom", "custom-value");
        expect(res.setHeader).not.toHaveBeenCalledWith("Empty", expect.anything());
        expect(next).toHaveBeenCalled();
    });

    test("handles non-object options safely", () => {
        const middleware = securityHeaders("invalid");
        const res = buildRes();
        const next = jest.fn();

        middleware({}, res, next);

        expect(res.setHeader).toHaveBeenCalledWith(
            "X-Content-Type-Options",
            "nosniff",
        );
        expect(next).toHaveBeenCalled();
    });

    test("default export equals named export", () => {
        expect(securityHeadersDefault).toBe(securityHeaders);
    });
});
