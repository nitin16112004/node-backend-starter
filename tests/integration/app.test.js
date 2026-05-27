import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import express from "express";
import { z } from "zod";
import {
    authenticate,
    authorizeRoles,
    errorHandler,
    requestSanitizer,
    sendError,
    sendSuccess,
    signAccessToken,
    validate,
    verifyToken,
} from "../../src/index.js";
import { ERROR_CODES, HTTP_STATUS } from "../../src/constants/index.js";

const SECRET = "integration-secret";

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(requestSanitizer());

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
                { secret: SECRET },
            );
            return sendSuccess(res, { data: { token } });
        },
    );

    app.get(
        "/profile",
        authenticate({ secret: SECRET }),
        (req, res) => sendSuccess(res, { data: { user: req.user } }),
    );

    app.get(
        "/admin",
        authenticate({ secret: SECRET }),
        authorizeRoles(["admin"]),
        (_req, res) => sendSuccess(res, { message: "Admin access granted" }),
    );

    app.use((req, res) => sendError(res, { statusCode: 404, message: "Not found" }));
    app.use(errorHandler);

    return app;
};

const startServer = async () => {
    const app = createApp();
    const server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    return { server, baseUrl: `http://127.0.0.1:${port}` };
};

describe("integration/app", () => {
    let server;
    let baseUrl;

    beforeAll(async () => {
        const started = await startServer();
        server = started.server;
        baseUrl = started.baseUrl;
    });

    afterAll(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    test("login returns a token and sanitizes input", async () => {
        const response = await fetch(`${baseUrl}/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ username: "  Alice\u0000 ", role: "admin" }),
        });

        expect(response.status).toBe(HTTP_STATUS.OK);
        const payload = await response.json();
        expect(payload.success).toBe(true);
        expect(payload.data.token).toEqual(expect.any(String));

        const decoded = verifyToken(payload.data.token, {
            secret: SECRET,
            expectedType: "access",
        });
        expect(decoded.sub).toBe("Alice");
        expect(decoded.role).toBe("admin");
    });

    test("profile requires authentication", async () => {
        const response = await fetch(`${baseUrl}/profile`);
        const payload = await response.json();

        expect(response.status).toBe(HTTP_STATUS.UNAUTHORIZED);
        expect(payload.code).toBe(ERROR_CODES.UNAUTHORIZED);
        expect(payload.success).toBe(false);
    });

    test("admin requires role", async () => {
        const token = signAccessToken(
            { sub: "user-1", role: "user" },
            { secret: SECRET },
        );
        const response = await fetch(`${baseUrl}/admin`, {
            headers: { authorization: `Bearer ${token}` },
        });
        const payload = await response.json();

        expect(response.status).toBe(HTTP_STATUS.FORBIDDEN);
        expect(payload.code).toBe(ERROR_CODES.FORBIDDEN);
        expect(payload.success).toBe(false);
    });

    test("admin accepts admin role", async () => {
        const token = signAccessToken(
            { sub: "admin-1", role: "admin" },
            { secret: SECRET },
        );
        const response = await fetch(`${baseUrl}/admin`, {
            headers: { authorization: `Bearer ${token}` },
        });
        const payload = await response.json();

        expect(response.status).toBe(HTTP_STATUS.OK);
        expect(payload.success).toBe(true);
        expect(payload.message).toBe("Admin access granted");
    });
});
