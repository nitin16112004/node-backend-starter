/**
 * Config schema using Zod.
 * @module config/schema
 */

import { z } from "zod";
import { LOG_LEVELS } from "../constants/index.js";

const logLevelSchema = z.enum(LOG_LEVELS);

export const configSchema = z
    .object({
        env: z.enum(["development", "test", "production"]),
        app: z.object({
            name: z.string().min(1),
            port: z.number().int().positive().max(65535),
        }),
        auth: z.object({
            jwt: z.object({
                accessTokenSecret: z.string().min(1, "JWT access token secret is required"),
                refreshTokenSecret: z.string().min(1, "JWT refresh token secret is required"),
                accessTokenTtl: z.string().min(1),
                refreshTokenTtl: z.string().min(1),
                issuer: z.string().optional(),
                audience: z.string().optional(),
            }),
        }),
        log: z.object({
            level: logLevelSchema,
        }),
        security: z.object({
            cors: z.object({
                origin: z.union([z.string(), z.array(z.string())]),
                methods: z.array(z.string()),
                credentials: z.boolean(),
            }),
            rateLimit: z.object({
                windowMs: z.number().int().positive(),
                max: z.number().int().positive(),
            }),
            csrf: z.object({
                enabled: z.boolean(),
                cookie: z.boolean(),
            }),
            ipFilter: z.object({
                allow: z.array(z.string()),
                block: z.array(z.string()),
            }),
        }),
    })
    .strict();

export default configSchema;
