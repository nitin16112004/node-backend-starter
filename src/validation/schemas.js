/**
 * Reusable validation schemas.
 * @module validation/schemas
 */

import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const idSchema = z.string().min(1);

export const emailSchema = z.string().email();

export const passwordSchema = z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number");

export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export const sortSchema = z.object({
    sortBy: z.string().min(1),
    order: z.enum(["asc", "desc"]).default("asc"),
});

export default {
    uuidSchema,
    idSchema,
    emailSchema,
    passwordSchema,
    paginationSchema,
    sortSchema,
};
