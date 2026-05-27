import { jest } from "@jest/globals";

const csurf = jest.fn(() => (_req, _res, next) => next());

export default csurf;
