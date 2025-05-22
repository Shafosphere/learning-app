import ApiError from "../../../errors/ApiError.js";
import { getUserById } from "../../../repositories/user.repo.js";

// Middleware do sprawdzenia, czy użytkownik istnieje przed usunięciem własnego konta
export const deleteUserValidator = [
  async (req, res, next) => {
    const userId = req.user.id;
    if (!userId) {
      return next(
        new ApiError(400, "ERR_MISSING_USER_ID", "User ID not provided.")
      );
    }

    try {
      const user = await getUserById(userId);
      if (!user) {
        return next(
          new ApiError(404, "ERR_USER_NOT_FOUND", "User not found.")
        );
      }
      // attach user for controller if needed
      req.userData = user;
      next();
    } catch (error) {
      return next(
        new ApiError(500, "ERR_INTERNAL_SERVER", "Internal Server Error.")
      );
    }
  },
];
