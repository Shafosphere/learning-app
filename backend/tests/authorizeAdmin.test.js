// tests/authorizeAdmin.test.js
import authorizeAdmin from "../middleware/validators/admin_and_token/authorizeAdmin";

describe("authorizeAdmin middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = { user: { role: null } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    console.log = jest.fn();
  });

  it("powinno zwrócić 403, gdy rola użytkownika nie jest admin", () => {
    req.user.role = "user";

    authorizeAdmin(req, res, next);

    expect(console.log).toHaveBeenCalledWith(
      "Access denied. User is not an admin."
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "ERR_USER_NOT_ADMIN",
      code: "ERR_USER_NOT_ADMIN",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("powinno wywołać next(), gdy rola użytkownika to admin", () => {
    req.user.role = "admin";

    authorizeAdmin(req, res, next);

    expect(console.log).toHaveBeenCalledWith("Got Access, user is an admin.");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
