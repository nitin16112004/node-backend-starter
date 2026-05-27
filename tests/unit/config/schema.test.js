import { describe, expect, test } from "@jest/globals";
import { configSchema } from "../../../src/config/schema.js";

const validConfig = {
    env: "test",
    app: {
        name: "backend-kit",
        port: 3000,
    },
    auth: {
        jwt: {
            accessTokenSecret: "access",
            refreshTokenSecret: "refresh",
            accessTokenTtl: "15m",
            refreshTokenTtl: "7d",
            issuer: "issuer",
            audience: "audience",
        },
    },
    log: {
        level: "info",
    },
    security: {
        cors: {
            origin: ["https://example.com"],
            methods: ["GET"],
            credentials: false,
        },
        rateLimit: {
            windowMs: 60000,
            max: 100,
        },
        csrf: {
            enabled: false,
            cookie: true,
        },
        ipFilter: {
            allow: [],
            block: [],
        },
    },
};

describe("config/schema", () => {
    test("parses valid configuration", () => {
        expect(configSchema.parse(validConfig)).toEqual(validConfig);
    });

    test("rejects invalid configuration", () => {
        const invalid = { ...validConfig };
        invalid.auth = { jwt: { ...invalid.auth.jwt, accessTokenSecret: "" } };
        expect(() => configSchema.parse(invalid)).toThrow();
    });
});
