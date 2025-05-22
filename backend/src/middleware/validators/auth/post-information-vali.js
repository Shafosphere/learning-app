import ApiError from "../../../errors/ApiError.js";
import { getUserByUserName } from "../../../repositories/user.repo.js";
import { validationResult } from "express-validator";

// Validator for ensuring authenticated user exists in database
export const getUserInformationValidator = [
  async (req, res, next) => {
    // Ensure username is present on request
    const username = req.user?.username;
    if (!username) {
      return next(
        new ApiError(400, "ERR_MISSING_USERNAME", "Username is required.")
      );
    }

    try {
      // Fetch user data from repository
      const user = await getUserByUserName(username);
      if (!user) {
        return next(new ApiError(404, "ERR_USER_NOT_FOUND", "User not found."));
      }
      // Attach fetched data for controller use
      req.userData = user;
      next();
    } catch (error) {
      // Unexpected error
      return next(
        new ApiError(500, "ERR_INTERNAL_SERVER", "Internal Server Error.")
      );
    }
  },
];
