import ApiError from "../../../errors/ApiError.js";
import { throwErr } from "../../../errors/throwErr.js";

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.log("Access denied. User is not an admin.");
    return next(throwErr("USER_NOT_ADMIN")); // rzuca błąd z klucza USER_NOT_ADMIN
  }
  console.log("Got Access, user is an admin.");
  next();
};

export default authorizeAdmin;
