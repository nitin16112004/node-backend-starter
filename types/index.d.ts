import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";

export const HTTP_STATUS: Readonly<Record<string, number>>;
export const ERROR_CODES: Readonly<Record<string, string>>;
export const TOKEN_TYPES: Readonly<{ ACCESS: "access"; REFRESH: "refresh" }>;
export const LOG_LEVELS: Readonly<string[]>;
export const DEFAULT_HEADERS: Readonly<Record<string, string>>;
export const ROLES: Readonly<Record<string, string>>;

export class AppError extends Error {
    statusCode: number;
    code: string;
    isOperational: boolean;
    details?: unknown;
    constructor(
        message: string,
        statusCode?: number,
        code?: string,
        isOperational?: boolean,
        details?: unknown,
    );
    toJSON(): {
        name: string;
        message: string;
        statusCode: number;
        code: string;
        isOperational: boolean;
        details?: unknown;
    };
}

export const asyncHandler: (fn: RequestHandler) => RequestHandler;
export const errorHandler: (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => void;
export const formatError: (error: unknown) => {
  name: string;
  message: string;
  statusCode: number;
  code: string;
  isOperational: boolean;
  details?: unknown;
};

export type JwtSignOptions = {
    secret: string;
    expiresIn?: string;
    issuer?: string;
    audience?: string;
    subject?: string;
    jwtid?: string;
};

export type JwtVerifyOptions = {
    secret: string;
    issuer?: string;
    audience?: string;
    clockTolerance?: number;
    ignoreExpiration?: boolean;
    expectedType?: "access" | "refresh";
};

export const signAccessToken: (
    payload: Record<string, unknown>,
    options: JwtSignOptions,
) => string;
export const signRefreshToken: (
    payload: Record<string, unknown>,
    options: JwtSignOptions,
) => string;
export const verifyToken: (
    token: string,
    options: JwtVerifyOptions,
) => Record<string, unknown>;
export const extractBearerToken: (
    headerValue: string | string[] | undefined,
) => string | null;

export type AuthenticateOptions = {
    secret: string;
    tokenType?: "access" | "refresh";
    header?: string;
    userProperty?: string;
    required?: boolean;
    getToken?: (req: Request) => string | null;
    verifyOptions?: Partial<JwtVerifyOptions>;
};

export const authenticate: (options: AuthenticateOptions) => RequestHandler;

export type AuthorizeRolesOptions = {
    userProperty?: string;
    roleProperty?: string;
    rolesProperty?: string;
};

export const authorizeRoles: (
    allowedRoles: string[] | string,
    options?: AuthorizeRolesOptions,
) => RequestHandler;

export const defaultConfig: Readonly<Record<string, unknown>>;
export const configSchema: ZodSchema;
export const loadConfig: (options?: {
    env?: NodeJS.ProcessEnv;
    overrides?: Record<string, unknown>;
    schema?: ZodSchema;
}) => Readonly<Record<string, unknown>>;

export class PluginSystem {
    register(
        name: string,
        handler: (context: Record<string, unknown>, meta: Record<string, unknown>) => void | Promise<void>,
        options?: { order?: number; meta?: Record<string, unknown> },
    ): PluginSystem;
    execute(context?: Record<string, unknown>): Promise<Record<string, unknown>>;
    list(): Array<Record<string, unknown>>;
    clear(): void;
}
export const createPluginSystem: () => PluginSystem;

export const sendSuccess: (
    res: Response,
    options?: {
        statusCode?: number;
        message?: string;
        data?: unknown;
        meta?: Record<string, unknown>;
    },
) => Response;
export const sendError: (
    res: Response,
    options?: {
        statusCode?: number;
        message?: string;
        code?: string;
        details?: unknown;
    },
) => Response;

export const createRateLimiter: (options?: Record<string, unknown>) => RequestHandler;
export const createHelmet: (options?: Record<string, unknown>) => RequestHandler;
export const createCors: (options?: Record<string, unknown>) => RequestHandler;
export const createCsrf: (options?: Record<string, unknown>) => RequestHandler;
export const createXssClean: (options?: Record<string, unknown>) => RequestHandler;
export const securityHeaders: (options?: { headers?: Record<string, string> }) => RequestHandler;
export const ipFilter: (options?: { allow?: string[]; block?: string[] }) => RequestHandler;
export const requestSanitizer: (options?: {
    trim?: boolean;
    removeNullBytes?: boolean;
    maxDepth?: number;
}) => RequestHandler;

export const isObject: (value: unknown) => boolean;
export const deepFreeze: <T>(value: T) => Readonly<T>;
export const deepClone: <T>(value: T) => T;
export const deepMerge: (...sources: unknown[]) => Record<string, unknown>;
export const pick: (
    obj: Record<string, unknown>,
    keys: string[],
) => Record<string, unknown>;
export const omit: (
    obj: Record<string, unknown>,
    keys: string[],
) => Record<string, unknown>;
export const sleep: (ms: number) => Promise<void>;
export const safeJSONParse: <T = unknown>(
  value: string,
  fallback?: T,
) => T | null;

export type Logger = {
    info: (message: string, meta?: Record<string, unknown>) => void;
    warn: (message: string, meta?: Record<string, unknown>) => void;
    error: (message: string, meta?: Record<string, unknown>) => void;
    debug: (message: string, meta?: Record<string, unknown>) => void;
    child: (bindings?: Record<string, unknown>) => Logger;
};

export const createLogger: (options?: {
    level?: "error" | "warn" | "info" | "debug";
    name?: string;
    timestamp?: boolean;
    bindings?: Record<string, unknown>;
    write?: (level: string, line: string) => void;
}) => Logger;

export const uuidv4: () => string;
export const isUuid: (value: string) => boolean;

export const validate: (schemas?: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}) => RequestHandler;

export const uuidSchema: ZodSchema;
export const idSchema: ZodSchema;
export const emailSchema: ZodSchema;
export const passwordSchema: ZodSchema;
export const paginationSchema: ZodSchema;
export const sortSchema: ZodSchema;
