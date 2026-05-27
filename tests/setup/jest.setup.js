import { afterAll, afterEach, beforeAll, beforeEach, jest } from "@jest/globals";

const ORIGINAL_ENV = { ...process.env };

const resetEnv = () => {
    process.env = { ...ORIGINAL_ENV };
};

const restoreEnv = () => {
    process.env = { ...ORIGINAL_ENV };
};

globalThis.mockRequest = (overrides = {}) => ({
    headers: {},
    params: {},
    query: {},
    body: {},
    ...overrides,
});

globalThis.mockResponse = (overrides = {}) => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    getHeader: jest.fn(),
    ...overrides,
});

globalThis.mockNext = () => jest.fn();

globalThis.withEnv = async (overrides, fn) => {
    const previous = process.env;
    process.env = { ...previous, ...overrides };
    try {
        return await fn();
    } finally {
        process.env = previous;
    }
};

beforeAll(() => {
    resetEnv();
});

beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    resetEnv();
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
});

afterAll(() => {
    restoreEnv();
    jest.clearAllMocks();
    jest.useRealTimers();
});
