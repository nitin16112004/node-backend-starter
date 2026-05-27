import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { loadConfig } from "../../../src/config/loader.js";

describe("config/loader", () => {
    const baseEnv = {
        NODE_ENV: "test",
        JWT_ACCESS_SECRET: "access-secret",
        JWT_REFRESH_SECRET: "refresh-secret",
    };

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test("loads config from env with defaults", () => {
        const config = loadConfig({ env: baseEnv });
        expect(config.env).toBe("test");
        expect(config.auth.jwt.accessTokenSecret).toBe("access-secret");
        expect(Object.isFrozen(config)).toBe(true);
    });

    test("parses env values for security config", () => {
        const env = {
            ...baseEnv,
            CORS_ORIGIN: '["https://a.com","https://b.com"]',
            CORS_METHODS: "GET,POST",
            CORS_CREDENTIALS: "true",
            RATE_LIMIT_WINDOW_MS: "1000",
            RATE_LIMIT_MAX: "5",
            CSRF_ENABLED: "true",
            CSRF_COOKIE: "false",
            IP_ALLOWLIST: "127.0.0.1, 10.0.0.1",
            IP_BLOCKLIST: "192.168.0.1",
        };

        const config = loadConfig({ env });
        expect(config.security.cors.origin).toEqual(["https://a.com", "https://b.com"]);
        expect(config.security.cors.methods).toEqual(["GET", "POST"]);
        expect(config.security.cors.credentials).toBe(true);
        expect(config.security.rateLimit.windowMs).toBe(1000);
        expect(config.security.rateLimit.max).toBe(5);
        expect(config.security.csrf.enabled).toBe(true);
        expect(config.security.csrf.cookie).toBe(false);
        expect(config.security.ipFilter.allow).toEqual(["127.0.0.1", "10.0.0.1"]);
        expect(config.security.ipFilter.block).toEqual(["192.168.0.1"]);
    });

    test("supports overrides", () => {
        const config = loadConfig({
            env: baseEnv,
            overrides: {
                app: { name: "custom-app" },
                log: { level: "debug" },
            },
        });

        expect(config.app.name).toBe("custom-app");
        expect(config.log.level).toBe("debug");
    });

    test("throws when env is invalid", () => {
        expect(() => loadConfig({ env: null })).toThrow(TypeError);
    });

    test("throws when overrides are invalid", () => {
        expect(() => loadConfig({ env: baseEnv, overrides: "bad" })).toThrow(
            TypeError,
        );
    });

    test("throws when schema is invalid", () => {
        expect(() =>
            loadConfig({ env: baseEnv, schema: { parse: null } }),
        ).toThrow(TypeError);
    });

    test("throws when required secrets are missing", () => {
        expect(() => loadConfig({ env: { NODE_ENV: "test" } })).toThrow();
    });

    test("uses custom schema when provided", () => {
        const schema = { parse: jest.fn().mockReturnValue({ env: "test" }) };
        const config = loadConfig({ env: baseEnv, schema });
        expect(schema.parse).toHaveBeenCalled();
        expect(config.env).toBe("test");
        expect(Object.isFrozen(config)).toBe(true);
    });
});
