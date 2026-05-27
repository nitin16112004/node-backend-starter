import { describe, expect, jest, test } from "@jest/globals";
import requestSanitizerDefault, {
    requestSanitizer,
} from "../../../src/security/requestSanitizer.js";

const runMiddleware = (middleware, req) => {
    const next = jest.fn();
    middleware(req, {}, next);
    return next;
};

describe("security/requestSanitizer", () => {
    test("throws on invalid maxDepth", () => {
        expect(() => requestSanitizer({ maxDepth: 0 })).toThrow(TypeError);
        expect(() => requestSanitizer({ maxDepth: -2 })).toThrow(TypeError);
        expect(() => requestSanitizer({ maxDepth: NaN })).toThrow(TypeError);
    });

    test("sanitizes body, query, and params", () => {
        const middleware = requestSanitizer();
        const req = {
            body: {
                name: "  Alice\u0000 ",
                nested: { value: "  test  " },
                list: ["  one\u0000", "two  "],
                __proto__: { polluted: true },
                constructor: { value: "skip" },
                prototype: { value: "skip" },
            },
            query: { q: "  search\u0000 " },
            params: { id: "  123 " },
        };

        runMiddleware(middleware, req);

        expect(req.body).toEqual({
            name: "Alice",
            nested: { value: "test" },
            list: ["one", "two"],
        });
        expect(req.query).toEqual({ q: "search" });
        expect(req.params).toEqual({ id: "123" });
        expect(Object.prototype.hasOwnProperty.call(req.body, "__proto__")).toBe(
            false,
        );
    });

    test("respects maxDepth without sanitizing deeper levels", () => {
        const middleware = requestSanitizer({ maxDepth: 1 });
        const req = {
            body: {
                level1: {
                    level2: "  keep  ",
                },
                top: "  trim  ",
            },
        };

        runMiddleware(middleware, req);

        expect(req.body.top).toBe("trim");
        expect(req.body.level1.level2).toBe("  keep  ");
    });

    test("handles missing request sections safely", () => {
        const middleware = requestSanitizer();
        const req = {};
        const next = runMiddleware(middleware, req);
        expect(next).toHaveBeenCalledWith();
        expect(req).toEqual({});
    });

    test("default export equals named export", () => {
        expect(requestSanitizerDefault).toBe(requestSanitizer);
    });
});
