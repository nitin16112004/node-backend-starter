import { jest } from "@jest/globals";

const xssClean = jest.fn(() => (_req, _res, next) => next());

export default xssClean;
