import { describe, expect, jest, test } from "@jest/globals";
import ipFilterDefault, { ipFilter } from "../../../src/security/ipFilter.js";
import { AppError } from "../../../src/errors/AppError.js";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/index.js";

const buildReq = (ip) => ({
    ip,
    connection: { remoteAddress: ip },
});

const runMiddleware = (middleware, req) => {
    const next = jest.fn();
    middleware(req, {}, next);
    return next;
};

describe("security/ipFilter", () => {
    test("allows when no allow or block lists provided", () => {
        const middleware = ipFilter();
        const next = runMiddleware(middleware, buildReq("10.0.0.1"));
        expect(next).toHaveBeenCalledWith();
    });

    test("blocks when IP is in block list", () => {
        const middleware = ipFilter({ block: ["10.0.0.1"] });
        const next = runMiddleware(middleware, buildReq("10.0.0.1"));
        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe("IP blocked");
        expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
        expect(error.code).toBe(ERROR_CODES.IP_BLOCKED);
    });

    test("allows only IPs in allow list", () => {
        const middleware = ipFilter({ allow: ["192.168.1.10"] });
        const next = runMiddleware(middleware, buildReq("192.168.1.10"));
        expect(next).toHaveBeenCalledWith();
    });

    test("rejects IPs not in allow list", () => {
        const middleware = ipFilter({ allow: ["192.168.1.10"] });
        const next = runMiddleware(middleware, buildReq("10.0.0.5"));
        const error = next.mock.calls[0][0];

        expect(error).toBeInstanceOf(AppError);
        expect(error.message).toBe("IP not allowed");
        expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
        expect(error.code).toBe(ERROR_CODES.IP_BLOCKED);
    });

    test("normalizes IPv6-mapped IPv4 addresses", () => {
        const middleware = ipFilter({ allow: ["127.0.0.1"] });
        const next = runMiddleware(middleware, buildReq("::ffff:127.0.0.1"));
        expect(next).toHaveBeenCalledWith();
    });

    test("filters invalid entries in lists", () => {
        const middleware = ipFilter({
            allow: ["", "   ", 123, "10.0.0.1"],
        });
        const next = runMiddleware(middleware, buildReq("10.0.0.1"));
        expect(next).toHaveBeenCalledWith();
    });

    test("default export equals named export", () => {
        expect(ipFilterDefault).toBe(ipFilter);
    });
});
