import { beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { fileURLToPath } from "url";
import { AppError } from "../../../src/errors/AppError.js";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/index.js";

const verifyTokenMock = jest.fn();
const extractBearerTokenMock = jest.fn();
const jwtModulePath = fileURLToPath(new URL("../../../src/auth/jwt.js", import.meta.url));

jest.unstable_mockModule(jwtModulePath, () => ({
    verifyToken: verifyTokenMock,
    extractBearerToken: extractBearerTokenMock,
}));

let authDefault;
let authenticate;
let authorizeRoles;

beforeAll(async () => {
    const mod = await import("../../../src/auth/middleware.js");
    authDefault = mod.default;
    authenticate = mod.authenticate;
    authorizeRoles = mod.authorizeRoles;
});

const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
});

describe("auth/middleware exports", () => {
    test("exports middleware helpers and default object", () => {
        expect(typeof authenticate).toBe("function");
        expect(typeof authorizeRoles).toBe("function");
        expect(authDefault).toEqual({ authenticate, authorizeRoles });
        expect(Object.isFrozen(authDefault)).toBe(true);
    });
});

describe("authenticate", () => {
    beforeEach(() => {
        verifyTokenMock.mockReset();
        extractBearerTokenMock.mockReset();
    });

    test("validates options", () => {
        expect(() => authenticate()).toThrow(TypeError);
        expect(() => authenticate({})).toThrow(TypeError);
        expect(() => authenticate({ secret: "" })).toThrow(TypeError);
        expect(() => authenticate({ secret: "s", tokenType: "bad" })).toThrow(
            TypeError,
        );
        expect(() => authenticate({ secret: "s", userProperty: "" })).toThrow(
            TypeError,
        );
        expect(() => authenticate({ secret: "s", header: "" })).toThrow(TypeError);
    });

    test("authenticates and attaches payload", () => {
        verifyTokenMock.mockReturnValue({ sub: "user-1" });
        extractBearerTokenMock.mockReturnValue("token");
        const req = { headers: { authorization: "Bearer token" } };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret" })(req, res, next);

        expect(extractBearerTokenMock).toHaveBeenCalledWith("Bearer token");
        expect(verifyTokenMock).toHaveBeenCalledWith("token", {
            secret: "secret",
            expectedType: "access",
        });
        expect(req.user).toEqual({ sub: "user-1" });
        expect(next).toHaveBeenCalledWith();
    });

    test("uses custom header option", () => {
        verifyTokenMock.mockReturnValue({ sub: "user-1" });
        extractBearerTokenMock.mockReturnValue("token");
        const req = { headers: { "x-auth": "Bearer custom" } };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret", header: "X-Auth" })(req, res, next);

        expect(extractBearerTokenMock).toHaveBeenCalledWith("Bearer custom");
        expect(verifyTokenMock).toHaveBeenCalledWith("token", {
            secret: "secret",
            expectedType: "access",
        });
        expect(next).toHaveBeenCalledWith();
    });

    test("uses getToken when provided", () => {
        verifyTokenMock.mockReturnValue({ sub: "user-2" });
        const req = { headers: {} };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret", getToken: () => "custom" })(
            req,
            res,
            next,
        );

        expect(extractBearerTokenMock).not.toHaveBeenCalled();
        expect(verifyTokenMock).toHaveBeenCalledWith("custom", {
            secret: "secret",
            expectedType: "access",
        });
    });

    test("returns AppError when getToken returns empty", () => {
        const req = { headers: {} };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret", getToken: () => "" })(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    });

    test("skips auth when token missing and not required", () => {
        extractBearerTokenMock.mockReturnValue(null);
        const req = { headers: {} };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret", required: false })(req, res, next);

        expect(verifyTokenMock).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });

    test("passes through unexpected errors", () => {
        const unexpected = new Error("unexpected");
        extractBearerTokenMock.mockReturnValue("token");
        verifyTokenMock.mockImplementation(() => {
            throw unexpected;
        });
        const req = { headers: { authorization: "Bearer token" } };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret" })(req, res, next);

        expect(next).toHaveBeenCalledWith(unexpected);
    });

    test("returns AppError when token missing and required", () => {
        extractBearerTokenMock.mockReturnValue(null);
        const req = { headers: {} };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret" })(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
        expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    test("maps token expiration errors", () => {
        extractBearerTokenMock.mockReturnValue("token");
        verifyTokenMock.mockImplementation(() => {
            const err = new Error("expired");
            err.name = "TokenExpiredError";
            throw err;
        });
        const req = { headers: { authorization: "Bearer token" } };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret" })(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ERROR_CODES.TOKEN_EXPIRED);
    });

    test("maps invalid token errors", () => {
        extractBearerTokenMock.mockReturnValue("token");
        verifyTokenMock.mockImplementation(() => {
            const err = new Error("invalid");
            err.name = "JsonWebTokenError";
            throw err;
        });
        const req = { headers: { authorization: "Bearer token" } };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret" })(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ERROR_CODES.INVALID_TOKEN);
    });

    test("maps invalid token code errors", () => {
        extractBearerTokenMock.mockReturnValue("token");
        verifyTokenMock.mockImplementation(() => {
            const err = new Error("invalid");
            err.code = "INVALID_TOKEN";
            throw err;
        });
        const req = { headers: { authorization: "Bearer token" } };
        const res = createRes();
        const next = jest.fn();

        authenticate({ secret: "secret" })(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ERROR_CODES.INVALID_TOKEN);
    });
});

describe("authorizeRoles", () => {
    test("validates allowed roles and options", () => {
        expect(() => authorizeRoles([])).toThrow(TypeError);
        expect(() => authorizeRoles("")).toThrow(TypeError);
        expect(() => authorizeRoles(["admin"], { userProperty: "" })).toThrow(
            TypeError,
        );
    });

    test("rejects when user is missing", () => {
        const req = {};
        const res = createRes();
        const next = jest.fn();

        authorizeRoles(["admin"])(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    });

    test("rejects when role is not allowed", () => {
        const req = { user: { role: "user" } };
        const res = createRes();
        const next = jest.fn();

        authorizeRoles(["admin"])(req, res, next);

        const error = next.mock.calls[0][0];
        expect(error).toBeInstanceOf(AppError);
        expect(error.code).toBe(ERROR_CODES.FORBIDDEN);
    });

    test("allows when role matches", () => {
        const req = { user: { roles: ["admin", "user"] } };
        const res = createRes();
        const next = jest.fn();

        authorizeRoles(["admin"])(req, res, next);

        expect(next).toHaveBeenCalledWith();
    });

    test("allows when allowed roles is a string", () => {
        const req = { user: { role: "admin" } };
        const res = createRes();
        const next = jest.fn();

        authorizeRoles("admin")(req, res, next);

        expect(next).toHaveBeenCalledWith();
    });
});
