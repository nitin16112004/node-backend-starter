import { describe, expect, test } from "@jest/globals";
import {
    emailSchema,
    idSchema,
    paginationSchema,
    passwordSchema,
    sortSchema,
    uuidSchema,
} from "../../../src/validation/schemas.js";

describe("validation/schemas", () => {
    test("validates uuid schema", () => {
        expect(uuidSchema.safeParse("550e8400-e29b-41d4-a716-446655440000").success).toBe(
            true,
        );
        expect(uuidSchema.safeParse("not-uuid").success).toBe(false);
    });

    test("validates id and email schemas", () => {
        expect(idSchema.safeParse("id").success).toBe(true);
        expect(idSchema.safeParse("").success).toBe(false);
        expect(emailSchema.safeParse("test@example.com").success).toBe(true);
        expect(emailSchema.safeParse("bad").success).toBe(false);
    });

    test("validates password schema rules", () => {
        expect(passwordSchema.safeParse("Password1").success).toBe(true);
        expect(passwordSchema.safeParse("password1").success).toBe(false);
        expect(passwordSchema.safeParse("PASSWORD1").success).toBe(false);
        expect(passwordSchema.safeParse("Password").success).toBe(false);
    });

    test("applies pagination defaults", () => {
        const result = paginationSchema.parse({});
        expect(result).toEqual({ page: 1, limit: 20 });
    });

    test("validates sort schema defaults", () => {
        const result = sortSchema.parse({ sortBy: "name" });
        expect(result).toEqual({ sortBy: "name", order: "asc" });
    });
});
