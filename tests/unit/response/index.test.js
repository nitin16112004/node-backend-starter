import { describe, expect, jest, test } from "@jest/globals";
import responseDefault, {
    sendError,
    sendSuccess,
} from "../../../src/response/index.js";
import { ERROR_CODES, HTTP_STATUS } from "../../../src/constants/index.js";

const createRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});

describe("response exports", () => {
    test("exports helpers and default object", () => {
        expect(typeof sendSuccess).toBe("function");
        expect(typeof sendError).toBe("function");
        expect(responseDefault).toEqual({ sendSuccess, sendError });
        expect(Object.isFrozen(responseDefault)).toBe(true);
    });
});

describe("sendSuccess", () => {
    test("returns standardized success response", () => {
        const res = createRes();
        sendSuccess(res, { data: { ok: true } });

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        const payload = res.json.mock.calls[0][0];
        expect(payload.success).toBe(true);
        expect(payload.data).toEqual({ ok: true });
        expect(payload.timestamp).toEqual(expect.any(String));
    });

    test("normalizes status codes and meta", () => {
        const res = createRes();
        sendSuccess(res, { statusCode: 999, meta: "bad" });

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
        const payload = res.json.mock.calls[0][0];
        expect(payload.meta).toBeNull();
    });

    test("throws on invalid message", () => {
        const res = createRes();
        expect(() => sendSuccess(res, { message: "" })).toThrow(TypeError);
    });

    test("throws on invalid response object", () => {
        expect(() => sendSuccess({}, {})).toThrow(TypeError);
    });
});

describe("sendError", () => {
    test("returns standardized error response", () => {
        const res = createRes();
        sendError(res, { message: "Bad", statusCode: 400, code: "BAD" });

        expect(res.status).toHaveBeenCalledWith(400);
        const payload = res.json.mock.calls[0][0];
        expect(payload.success).toBe(false);
        expect(payload.message).toBe("Bad");
        expect(payload.code).toBe("BAD");
    });

    test("normalizes status codes and code", () => {
        const res = createRes();
        sendError(res, { statusCode: 999, code: 123 });

        expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
        const payload = res.json.mock.calls[0][0];
        expect(payload.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    });

    test("throws on invalid message", () => {
        const res = createRes();
        expect(() => sendError(res, { message: "" })).toThrow(TypeError);
    });
});
