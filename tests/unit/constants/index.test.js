import { describe, expect, test } from "@jest/globals";
import constantsDefault, {
    DEFAULT_HEADERS,
    ERROR_CODES,
    HTTP_STATUS,
    LOG_LEVELS,
    ROLES,
    TOKEN_TYPES,
} from "../../../src/constants/index.js";

describe("constants exports", () => {
    test("exports named constants and default object", () => {
        expect(HTTP_STATUS.OK).toBe(200);
        expect(ERROR_CODES.INVALID_TOKEN).toBe("INVALID_TOKEN");
        expect(TOKEN_TYPES.ACCESS).toBe("access");
        expect(LOG_LEVELS).toEqual(["error", "warn", "info", "debug"]);
        expect(DEFAULT_HEADERS.AUTHORIZATION).toBe("authorization");
        expect(ROLES.ADMIN).toBe("admin");

        expect(constantsDefault).toEqual({
            HTTP_STATUS,
            ERROR_CODES,
            TOKEN_TYPES,
            LOG_LEVELS,
            DEFAULT_HEADERS,
            ROLES,
        });
        expect(Object.isFrozen(constantsDefault)).toBe(true);
        expect(Object.isFrozen(HTTP_STATUS)).toBe(true);
        expect(Object.isFrozen(ERROR_CODES)).toBe(true);
    });
});
