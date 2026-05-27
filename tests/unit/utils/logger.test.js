import { describe, expect, jest, test } from "@jest/globals";
import createLoggerDefault, {
    LOG_LEVELS,
    createLogger,
} from "../../../src/utils/logger.js";

const parseLine = (line) => JSON.parse(line.trim());

describe("utils/logger exports", () => {
    test("exports createLogger and LOG_LEVELS", () => {
        expect(createLoggerDefault).toBe(createLogger);
        expect(typeof createLogger).toBe("function");
        expect(LOG_LEVELS).toEqual({
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
        });
        expect(Object.isFrozen(LOG_LEVELS)).toBe(true);
    });
});

describe("createLogger", () => {
    test("writes structured JSON and respects bindings", () => {
        const write = jest.fn();
        const logger = createLogger({
            level: "info",
            name: "api",
            timestamp: false,
            bindings: { service: "backend-kit" },
            write,
        });

        logger.info("hello", { requestId: "req-1" });

        expect(write).toHaveBeenCalledTimes(1);
        const [level, line] = write.mock.calls[0];
        expect(level).toBe("info");
        expect(parseLine(line)).toEqual({
            level: "info",
            message: "hello",
            service: "backend-kit",
            requestId: "req-1",
            logger: "api",
        });
        expect(Object.isFrozen(logger)).toBe(true);
    });

    test("includes timestamp when enabled", () => {
        const write = jest.fn();
        const logger = createLogger({ write });
        logger.info("with time");

        const record = parseLine(write.mock.calls[0][1]);
        expect(record.time).toEqual(expect.any(String));
    });

    test("uses default writer for info and warn levels", () => {
        const stdoutSpy = jest
            .spyOn(process.stdout, "write")
            .mockImplementation(() => true);
        const stderrSpy = jest
            .spyOn(process.stderr, "write")
            .mockImplementation(() => true);
        const logger = createLogger({ level: "info", timestamp: false });

        logger.info("hello");
        logger.warn("warn");

        expect(stdoutSpy).toHaveBeenCalled();
        expect(stderrSpy).toHaveBeenCalled();

        stdoutSpy.mockRestore();
        stderrSpy.mockRestore();
    });

    test("filters logs below minimum level", () => {
        const write = jest.fn();
        const logger = createLogger({ level: "warn", timestamp: false, write });
        logger.info("skip");
        logger.warn("go");

        expect(write).toHaveBeenCalledTimes(1);
        expect(parseLine(write.mock.calls[0][1]).message).toBe("go");
    });

    test("ignores non-object meta values", () => {
        const write = jest.fn();
        const logger = createLogger({ timestamp: false, write });
        logger.info("hello", "meta");

        expect(parseLine(write.mock.calls[0][1])).toEqual({
            level: "info",
            message: "hello",
        });
    });

    test("normalizes invalid level to info", () => {
        const write = jest.fn();
        const logger = createLogger({ level: "invalid", timestamp: false, write });
        logger.debug("skip");
        logger.info("go");

        expect(write).toHaveBeenCalledTimes(1);
        expect(parseLine(write.mock.calls[0][1]).message).toBe("go");
    });

    test("serializes Error metadata", () => {
        const write = jest.fn();
        const logger = createLogger({ timestamp: false, write });
        const error = new Error("boom");

        logger.error("failure", { error });
        const record = parseLine(write.mock.calls[0][1]);

        expect(record.error).toEqual({
            name: "Error",
            message: "boom",
            stack: expect.any(String),
        });
    });

    test("throws on empty messages", () => {
        const logger = createLogger({ timestamp: false, write: jest.fn() });
        expect(() => logger.info("")).toThrow(TypeError);
        expect(() => logger.info("   ")).toThrow(TypeError);
    });

    test("ignores non-object bindings", () => {
        const write = jest.fn();
        const logger = createLogger({ bindings: "bad", timestamp: false, write });
        logger.info("hello");
        expect(parseLine(write.mock.calls[0][1])).toEqual({
            level: "info",
            message: "hello",
        });
    });

    test("creates child logger with merged bindings", () => {
        const write = jest.fn();
        const logger = createLogger({
            level: "debug",
            timestamp: false,
            bindings: { a: 1 },
            write,
        });
        const child = logger.child({ b: 2 });
        child.debug("child");

        expect(write).toHaveBeenCalledTimes(1);
        const record = parseLine(write.mock.calls[0][1]);
        expect(record).toEqual({ level: "debug", message: "child", a: 1, b: 2 });
        expect(Object.isFrozen(child)).toBe(true);
    });

    test("creates child logger with non-object bindings", () => {
        const write = jest.fn();
        const logger = createLogger({ timestamp: false, bindings: { a: 1 }, write });
        const child = logger.child("bad");
        child.info("child");

        const record = parseLine(write.mock.calls[0][1]);
        expect(record).toEqual({ level: "info", message: "child", a: 1 });
    });

    test("omits logger name when not provided", () => {
        const write = jest.fn();
        const logger = createLogger({ timestamp: false, write });
        logger.info("hello");

        const record = parseLine(write.mock.calls[0][1]);
        expect(record.logger).toBeUndefined();
    });
});
