import express from "express";
import { z } from "zod";
import {
    asyncHandler,
    authenticate,
    authorizeRoles,
    createCors,
    createHelmet,
    createLogger,
    createPluginSystem,
    createRateLimiter,
    createXssClean,
    errorHandler,
    loadConfig,
    requestSanitizer,
    securityHeaders,
    sendError,
    sendSuccess,
    signAccessToken,
    validate,
} from "../src/index.js";

const config = loadConfig({
    overrides: {
        auth: {
            jwt: {
                accessTokenSecret: "dev-access-secret",
                refreshTokenSecret: "dev-refresh-secret",
            },
        },
    },
});

const logger = createLogger({ level: config.log.level, name: "example-app" });
const app = express();

app.use(express.json());
app.use(securityHeaders());
app.use(createHelmet());
app.use(createCors(config.security.cors));
app.use(createRateLimiter(config.security.rateLimit));
app.use(createXssClean());
app.use(requestSanitizer());

const plugins = createPluginSystem();
plugins.register("startup", async (context) => {
    context.startedAt = new Date().toISOString();
});
await plugins.execute({ app, logger });

app.post(
    "/login",
    validate({
        body: z.object({
            username: z.string().min(1),
            role: z.string().optional(),
        }),
    }),
    (req, res) => {
        const token = signAccessToken(
            { sub: req.body.username, role: req.body.role ?? "user" },
            { secret: config.auth.jwt.accessTokenSecret },
        );
        return sendSuccess(res, { data: { token } });
    },
);

app.get(
    "/profile",
    authenticate({ secret: config.auth.jwt.accessTokenSecret }),
    (req, res) => sendSuccess(res, { data: { user: req.user } }),
);

app.get(
    "/admin",
    authenticate({ secret: config.auth.jwt.accessTokenSecret }),
    authorizeRoles(["admin"]),
    (req, res) => sendSuccess(res, { message: "Admin access granted" }),
);

app.get(
    "/health",
    asyncHandler(async (req, res) => {
        return sendSuccess(res, { data: { status: "ok" } });
    }),
);

app.use((req, res) => sendError(res, { statusCode: 404, message: "Not found" }));
app.use(errorHandler);

const port = config.app.port;
app.listen(port, () => {
    logger.info("Example app started", { port });
});
