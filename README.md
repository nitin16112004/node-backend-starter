# backendkit

[![CI](https://github.com/nitin16112004/backendkit/actions/workflows/ci.yml/badge.svg)](https://github.com/nitin16112004/backendkit/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@nitinkumar16/backendkit)](https://www.npmjs.com/package/@nitinkumar16/backendkit)
[![License](https://img.shields.io/github/license/nitin16112004/backendkit)](LICENSE)

Production-ready backend starter kit for Node.js (18+) and Express. It provides JWT authentication, role-based authorization, validation, configuration management, security middleware, logging, plugins, and standardized error handling.

## Installation

```bash
npm install @nitinkumar16/backendkit
```

TypeScript declarations are included out of the box.

## Quick start

```js
import express from "express";
import {
  loadConfig,
  createLogger,
  createHelmet,
  createCors,
  createRateLimiter,
  requestSanitizer,
  securityHeaders,
  errorHandler,
  sendSuccess,
  signAccessToken,
} from "@nitinkumar16/backendkit";

const config = loadConfig({
  overrides: {
    auth: { jwt: { accessTokenSecret: "change-me", refreshTokenSecret: "change-me" } },
  },
});

const logger = createLogger({ level: config.log.level, name: "api" });
const app = express();

app.use(express.json());
app.use(securityHeaders());
app.use(createHelmet());
app.use(createCors(config.security.cors));
app.use(createRateLimiter(config.security.rateLimit));
app.use(requestSanitizer());

app.post("/login", (req, res) => {
  const token = signAccessToken({ sub: "user-123", role: "user" }, { secret: config.auth.jwt.accessTokenSecret });
  return sendSuccess(res, { data: { token } });
});

app.use(errorHandler);
```

## Middleware usage

```js
import { authenticate, authorizeRoles } from "@nitinkumar16/backendkit";

app.get(
  "/account",
  authenticate({ secret: config.auth.jwt.accessTokenSecret }),
  (req, res) => sendSuccess(res, { data: req.user }),
);

app.get(
  "/admin",
  authenticate({ secret: config.auth.jwt.accessTokenSecret }),
  authorizeRoles(["admin"]),
  (req, res) => sendSuccess(res, { message: "Admin access granted" }),
);
```

## Authentication

```js
import { signAccessToken, signRefreshToken, verifyToken } from "@nitinkumar16/backendkit";

const accessToken = signAccessToken(
  { sub: "user-123" },
  { secret: "access-secret", expiresIn: "15m" },
);
const refreshToken = signRefreshToken(
  { sub: "user-123" },
  { secret: "refresh-secret", expiresIn: "7d" },
);
const payload = verifyToken(accessToken, { secret: "access-secret", expectedType: "access" });
```

## Validation

```js
import { z } from "zod";
import { validate } from "@nitinkumar16/backendkit";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post("/users", validate({ body: createUserSchema }), (req, res) => {
  return sendSuccess(res, { data: req.body, statusCode: 201 });
});
```

## Plugin system

```js
import { createPluginSystem } from "@nitinkumar16/backendkit";

const plugins = createPluginSystem();

plugins.register("audit", async (context) => {
  context.audit = { enabled: true };
});

await plugins.execute({ app });
```

## Security middleware

```js
import {
  createHelmet,
  createCors,
  createRateLimiter,
  createCsrf,
  createXssClean,
  securityHeaders,
  ipFilter,
} from "@nitinkumar16/backendkit";

app.use(securityHeaders());
app.use(createHelmet());
app.use(createCors({ origin: "https://example.com" }));
app.use(createRateLimiter({ windowMs: 60000, max: 100 }));
app.use(createXssClean());
app.use(ipFilter({ allow: ["127.0.0.1"] }));
app.use(createCsrf({ cookie: true }));
```

## Standardized responses

```js
import { sendSuccess, sendError } from "@nitinkumar16/backendkit";

app.get("/status", (req, res) => sendSuccess(res, { data: { status: "ok" } }));
app.use((req, res) => sendError(res, { statusCode: 404, message: "Not found" }));
```

## API overview

### Auth
`signAccessToken`, `signRefreshToken`, `verifyToken`, `authenticate`, `authorizeRoles`

### Config
`loadConfig`, `defaultConfig`, `configSchema`

### Errors
`AppError`, `asyncHandler`, `errorHandler`

### Security
`createHelmet`, `createCors`, `createRateLimiter`, `createCsrf`, `createXssClean`, `securityHeaders`, `ipFilter`, `requestSanitizer`

### Utils
`createLogger`, `uuidv4`, `isUuid`, `deepMerge`, `deepClone`, `safeJSONParse`

## Example application

See `examples/express-app.js` for a complete Express integration.

## License

MIT
