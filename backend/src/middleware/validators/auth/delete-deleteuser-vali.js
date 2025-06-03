import { getUserById } from "../../../repositories/user.repo.js";
import { throwErr } from "../../../errors/throwErr.js";

// Middleware do sprawdzenia, czy użytkownik istnieje przed usunięciem własnego konta
export const deleteUserValidator = [
  async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
      return next(throwErr("MISSING_USER_ID")); // 400
    }

    try {
      const user = await getUserById(userId);
      if (!user) {
        return next(throwErr("USER_NOT_FOUND")); // 404
      }

      /* przekazujemy dane dalej do kontrolera */
      req.userData = user;
      next();
    } catch (e) {
      return next(throwErr("INTERNAL_SERVER")); // 500
    }
  },
];
