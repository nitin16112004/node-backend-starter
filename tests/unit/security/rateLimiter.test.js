import { describe, expect, jest, test } from "@jest/globals";
import createRateLimiterDefault, {
    createRateLimiter,
} from "../../../src/security/rateLimiter.js";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/index.js";

const buildReq = () => ({
    ip: "127.0.0.1",
    headers: {},
    method: "GET",
    originalUrl: "/test",
    baseUrl: "",
    path: "/test",
    app: { get: jest.fn().mockReturnValue(false) },
    connection: { remoteAddress: "127.0.0.1" },
});

const buildRes = () => ({
    statusCode: 200,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    getHeader: jest.fn(),
});

const invoke = (middleware, req) =>
    new Promise((resolve) => {
        const res = buildRes();
        res.json.mockImplementation((payload) => {
            resolve({ outcome: "handled", res, payload });
            return res;
        });
        middleware(req, res, (err) => resolve({ outcome: "next", res, err }));
    });

describe("security/rateLimiter", () => {
    test("throws on invalid windowMs", () => {
        expect(() => createRateLimiter({ windowMs: 0 })).toThrow(TypeError);
        expect(() => createRateLimiter({ windowMs: -10 })).toThrow(TypeError);
        expect(() => createRateLimiter({ windowMs: NaN })).toThrow(TypeError);
    });

    test("throws on invalid max", () => {
        expect(() => createRateLimiter({ max: 0 })).toThrow(TypeError);
        expect(() => createRateLimiter({ max: -1 })).toThrow(TypeError);
    });

    test("throws on invalid message", () => {
        expect(() => createRateLimiter({ message: "" })).toThrow(TypeError);
        expect(() => createRateLimiter({ message: "   " })).toThrow(TypeError);
    });

    test("returns middleware function", () => {
        const middleware = createRateLimiter();
        expect(typeof middleware).toBe("function");
    });

    test("enforces max and uses handler response", async () => {
        const limiter = createRateLimiter({
            windowMs: 1000,
            max: 1,
            message: "Slow down",
            standardHeaders: false,
            legacyHeaders: false,
        });

        const req = buildReq();
        const first = await invoke(limiter, req);
        expect(first.outcome).toBe("next");
        expect(first.err).toBeUndefined();

        const second = await invoke(limiter, req);
        expect(second.outcome).toBe("handled");
        expect(second.res.status).toHaveBeenCalledWith(HTTP_STATUS.TOO_MANY_REQUESTS);
        expect(second.payload).toEqual(
            expect.objectContaining({
                success: false,
                message: "Slow down",
                code: ERROR_CODES.RATE_LIMITED,
                timestamp: expect.any(String),
            }),
        );
        expect(Number.isNaN(Date.parse(second.payload.timestamp))).toBe(false);
    });

    test("default export equals named export", () => {
        expect(createRateLimiterDefault).toBe(createRateLimiter);
    });
});
