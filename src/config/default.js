/**
 * Default configuration values.
 * @module config/default
 */

import { deepFreeze } from "../utils/helpers.js";

export const defaultConfig = deepFreeze({
  env: "development",
  app: {
    name: "backend-kit-app",
        port: 3000,
    },
    auth: {
        jwt: {
            accessTokenSecret: "",
            refreshTokenSecret: "",
            accessTokenTtl: "15m",
            refreshTokenTtl: "7d",
            issuer: undefined,
            audience: undefined,
        },
    },
    log: {
        level: "info",
    },
    security: {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            credentials: false,
        },
        rateLimit: {
            windowMs: 15 * 60 * 1000,
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
});

export default defaultConfig;
