// tests/authenticateToken.test.js
import authenticateToken from "../middleware/validators/admin_and_token/authenticateToken.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js"; // adjust path as needed

jest.mock("jsonwebtoken");

describe("authenticateToken middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("zwraca 403 z ERR_TOKEN_NOT_FOUND, gdy brak tokena w ciasteczkach", () => {
    // req.cookies.token jest undefined
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "ERR_TOKEN_NOT_FOUND",
      code: "ERR_TOKEN_NOT_FOUND",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("zwraca 403 z ERR_INVALID_TOKEN, gdy jwt.verify zwraca błąd", () => {
    req.cookies.token = "invalid.token.here";

    // simulate jwt.verify callback with error
    jwt.verify.mockImplementation((token, key, cb) => {
      cb(new Error("invalid signature"), null);
    });

    authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "invalid.token.here",
      config.tokenKey,
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "ERR_INVALID_TOKEN",
      code: "ERR_INVALID_TOKEN",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("ustawia req.user i wywołuje next(), gdy token jest poprawny", () => {
    const fakePayload = { id: "user123", exp: Math.floor(Date.now() / 1000) + 3600 };
    req.cookies.token = "valid.token.here";

    // simulate jwt.verify callback with decoded payload
    jwt.verify.mockImplementation((token, key, cb) => {
      cb(null, fakePayload);
    });

    authenticateToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid.token.here",
      config.tokenKey,
      expect.any(Function)
    );
    expect(req.user).toEqual({
      id: fakePayload.id,
      exp: fakePayload.exp,
      expiresAt: fakePayload.exp * 1000,
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
