import { beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { AppError } from "../../../src/errors/AppError.js";
import { TOKEN_TYPES } from "../../../src/constants/index.js";

const signMock = jest.fn();
const verifyMock = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
    sign: signMock,
    verify: verifyMock,
    default: { sign: signMock, verify: verifyMock },
}));

let jwtDefault;
let extractBearerToken;
let signAccessToken;
let signRefreshToken;
let verifyToken;

beforeAll(async () => {
    const mod = await import("../../../src/auth/jwt.js");
    jwtDefault = mod.default;
    extractBearerToken = mod.extractBearerToken;
    signAccessToken = mod.signAccessToken;
    signRefreshToken = mod.signRefreshToken;
    verifyToken = mod.verifyToken;
});

beforeEach(() => {
    signMock.mockReset();
    verifyMock.mockReset();
});

describe("auth/jwt exports", () => {
    test("exports helpers and default object", () => {
        expect(typeof signAccessToken).toBe("function");
        expect(typeof signRefreshToken).toBe("function");
        expect(typeof verifyToken).toBe("function");
        expect(typeof extractBearerToken).toBe("function");
        expect(jwtDefault).toEqual({
            signAccessToken,
            signRefreshToken,
            verifyToken,
            extractBearerToken,
        });
        expect(Object.isFrozen(jwtDefault)).toBe(true);
    });
});

describe("signAccessToken", () => {
    test("signs access tokens with defaults", () => {
        signMock.mockReturnValue("token");
        const token = signAccessToken({ sub: "user-1" }, { secret: "secret" });

        expect(token).toBe("token");
        expect(signMock).toHaveBeenCalledWith(
            expect.objectContaining({ sub: "user-1", tokenType: TOKEN_TYPES.ACCESS }),
            "secret",
            expect.objectContaining({ expiresIn: "15m" }),
        );
    });

    test("uses safe issuer/audience defaults and omits undefined options", () => {
        signMock.mockReturnValue("token");
        signAccessToken(
            { sub: "user-2" },
            { secret: "secret", issuer: "   ", audience: "" },
        );

        const options = signMock.mock.calls[0][2];
        expect(options.issuer).toBe("backend-kit");
        expect(options.audience).toBe("backend-kit-users");
        expect(Object.prototype.hasOwnProperty.call(options, "subject")).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(options, "jwtid")).toBe(false);
    });

    test("passes issuer, audience, and algorithm when provided", () => {
        signMock.mockReturnValue("token");
        signAccessToken(
            { sub: "user-3" },
            {
                secret: "secret",
                issuer: "issuer",
                audience: "audience",
                algorithm: "HS512",
                subject: "subject",
                jwtid: "jwt-1",
            },
        );

        const options = signMock.mock.calls[0][2];
        expect(options).toEqual(
            expect.objectContaining({
                issuer: "issuer",
                audience: "audience",
                algorithm: "HS512",
                subject: "subject",
                jwtid: "jwt-1",
            }),
        );
    });

    test("throws on invalid payload", () => {
        expect(() => signAccessToken("invalid", { secret: "secret" })).toThrow(
            TypeError,
        );
    });

    test("throws when secret is missing", () => {
        expect(() => signAccessToken({ sub: "user" })).toThrow(TypeError);
    });

    test("throws on invalid secret", () => {
        expect(() => signAccessToken({ sub: "user" }, { secret: "" })).toThrow(
            TypeError,
        );
    });

    test("throws on empty expiresIn override", () => {
        expect(() =>
            signAccessToken({ sub: "user" }, { secret: "secret", expiresIn: "" }),
        ).toThrow(TypeError);
    });
});

describe("signRefreshToken", () => {
    test("signs refresh tokens with defaults", () => {
        signMock.mockReturnValue("refresh");
        const token = signRefreshToken({ sub: "user-1" }, { secret: "secret" });

        expect(token).toBe("refresh");
        expect(signMock).toHaveBeenCalledWith(
            expect.objectContaining({ sub: "user-1", tokenType: TOKEN_TYPES.REFRESH }),
            "secret",
            expect.objectContaining({ expiresIn: "7d" }),
        );
    });
});

describe("verifyToken", () => {
    test("throws when options are missing", () => {
        expect(() => verifyToken("token")).toThrow(TypeError);
    });

    test("verifies tokens and enforces token type", () => {
        verifyMock.mockReturnValue({ sub: "user-1", tokenType: "access" });

        const payload = verifyToken("token", {
            secret: "secret",
            expectedType: "access",
        });

        expect(payload).toEqual({ sub: "user-1", tokenType: "access" });
    });

    test("throws when expected token type mismatches", () => {
        verifyMock.mockReturnValue({ sub: "user-1", tokenType: "refresh" });

        expect(() =>
            verifyToken("token", { secret: "secret", expectedType: "access" }),
        ).toThrow(AppError);
    });

    test("throws when decoded payload is not an object", () => {
        verifyMock.mockReturnValue("bad");
        expect(() => verifyToken("token", { secret: "secret" })).toThrow(AppError);
    });

    test("throws on invalid token input", () => {
        expect(() => verifyToken("", { secret: "secret" })).toThrow(TypeError);
    });

    test("throws on invalid secret", () => {
        expect(() => verifyToken("token", { secret: "" })).toThrow(TypeError);
    });

    test("propagates underlying jwt errors", () => {
        const error = new Error("jwt failure");
        verifyMock.mockImplementation(() => {
            throw error;
        });

        expect(() => verifyToken("token", { secret: "secret" })).toThrow(
            "jwt failure",
        );
    });

    test("rethrows AppError instances", () => {
        const appError = new AppError("Invalid token", 401, "INVALID_TOKEN");
        verifyMock.mockImplementation(() => {
            throw appError;
        });

        expect(() => verifyToken("token", { secret: "secret" })).toThrow(appError);
    });
});

describe("extractBearerToken", () => {
    test("returns null for invalid headers", () => {
        expect(extractBearerToken()).toBeNull();
        expect(extractBearerToken(123)).toBeNull();
    });

    test("extracts token from bearer header", () => {
        expect(extractBearerToken("Bearer abc")).toBe("abc");
        expect(extractBearerToken("bearer   token")).toBe("token");
    });

    test("handles header arrays and invalid formats", () => {
        expect(extractBearerToken(["Bearer token"])).toBe("token");
        expect(extractBearerToken("Basic token")).toBeNull();
    });
});
