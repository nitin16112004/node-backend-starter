import { describe, expect, test } from "@jest/globals";
import * as validationIndex from "../../../src/validation/index.js";
import { validate } from "../../../src/validation/validate.js";
import {
    emailSchema,
    idSchema,
    paginationSchema,
    passwordSchema,
    sortSchema,
    uuidSchema,
} from "../../../src/validation/schemas.js";

describe("validation/index exports", () => {
    test("re-exports validate and schemas", () => {
        expect(validationIndex.validate).toBe(validate);
        expect(validationIndex.uuidSchema).toBe(uuidSchema);
        expect(validationIndex.idSchema).toBe(idSchema);
        expect(validationIndex.emailSchema).toBe(emailSchema);
        expect(validationIndex.passwordSchema).toBe(passwordSchema);
        expect(validationIndex.paginationSchema).toBe(paginationSchema);
        expect(validationIndex.sortSchema).toBe(sortSchema);
    });

    test("schemas expose zod helpers", () => {
        expect(typeof validationIndex.uuidSchema.safeParse).toBe("function");
        expect(typeof validationIndex.paginationSchema.parse).toBe("function");
    });
});
