import ApiError from "../../../errors/ApiError.js";

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.log("Access denied. User is not an admin.");
    return next(new ApiError(
      403,
      "ERR_USER_NOT_ADMIN",
      "User is not an admin"
    ));
  }
  console.log("Got Access, user is an admin.");
  next();
};

export default authorizeAdmin;
