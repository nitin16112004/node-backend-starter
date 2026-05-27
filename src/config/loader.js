/**
 * Configuration loader and validator.
 * @module config/loader
 */

import { defaultConfig } from "./default.js";
import { configSchema } from "./schema.js";
import { deepMerge, deepFreeze, safeJSONParse } from "../utils/helpers.js";

const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseArray = (value, fallback = []) => {
    if (Array.isArray(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = safeJSONParse(value, null);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
    return fallback;
};

const buildEnvConfig = (env) => ({
    env: env.NODE_ENV || defaultConfig.env,
    app: {
        name: env.APP_NAME || defaultConfig.app.name,
        port: parseNumber(env.PORT, defaultConfig.app.port),
    },
    auth: {
        jwt: {
            accessTokenSecret:
                env.JWT_ACCESS_SECRET || defaultConfig.auth.jwt.accessTokenSecret,
            refreshTokenSecret:
                env.JWT_REFRESH_SECRET || defaultConfig.auth.jwt.refreshTokenSecret,
            accessTokenTtl: env.JWT_ACCESS_TTL || defaultConfig.auth.jwt.accessTokenTtl,
            refreshTokenTtl:
                env.JWT_REFRESH_TTL || defaultConfig.auth.jwt.refreshTokenTtl,
            issuer: env.JWT_ISSUER || defaultConfig.auth.jwt.issuer,
            audience: env.JWT_AUDIENCE || defaultConfig.auth.jwt.audience,
        },
    },
    log: {
        level: env.LOG_LEVEL || defaultConfig.log.level,
    },
  security: {
    cors: {
      origin: env.CORS_ORIGIN
        ? parseArray(env.CORS_ORIGIN, null) || env.CORS_ORIGIN
        : defaultConfig.security.cors.origin,
      methods: parseArray(env.CORS_METHODS, defaultConfig.security.cors.methods),
      credentials:
        env.CORS_CREDENTIALS === undefined
          ? defaultConfig.security.cors.credentials
          : env.CORS_CREDENTIALS === "true",
    },
        rateLimit: {
            windowMs: parseNumber(
                env.RATE_LIMIT_WINDOW_MS,
                defaultConfig.security.rateLimit.windowMs,
            ),
            max: parseNumber(env.RATE_LIMIT_MAX, defaultConfig.security.rateLimit.max),
        },
    csrf: {
      enabled:
        env.CSRF_ENABLED === undefined
          ? defaultConfig.security.csrf.enabled
          : env.CSRF_ENABLED === "true",
      cookie:
        env.CSRF_COOKIE === undefined
          ? defaultConfig.security.csrf.cookie
          : env.CSRF_COOKIE === "true",
    },
        ipFilter: {
            allow: parseArray(env.IP_ALLOWLIST, defaultConfig.security.ipFilter.allow),
            block: parseArray(env.IP_BLOCKLIST, defaultConfig.security.ipFilter.block),
        },
    },
});

/**
 * Load, merge, and validate configuration.
 * @param {object} [options]
 * @param {NodeJS.ProcessEnv} [options.env=process.env]
 * @param {object} [options.overrides]
 * @param {import("zod").ZodSchema} [options.schema=configSchema]
 * @returns {Readonly<object>}
 */
export const loadConfig = (options = {}) => {
  const { env = process.env, overrides = {}, schema = configSchema } = options;
  if (!env || typeof env !== "object") {
    throw new TypeError("env must be an object");
  }
  if (overrides !== undefined && typeof overrides !== "object") {
    throw new TypeError("overrides must be an object");
  }
  if (!schema || typeof schema.parse !== "function") {
    throw new TypeError("schema must be a valid Zod schema");
  }
  const merged = deepMerge(defaultConfig, buildEnvConfig(env), overrides);
    const validated = schema.parse(merged);
    return deepFreeze(validated);
};

export default loadConfig;
