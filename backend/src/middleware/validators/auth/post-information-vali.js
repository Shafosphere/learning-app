import { getUserByUserName } from "../../../repositories/user.repo.js";
import { throwErr } from "../../../errors/throwErr.js";

export const getUserInformationValidator = [
  async (req, res, next) => {
    const username = req.user?.username;
    if (!username) {
      return next(throwErr("MISSING_USERNAME")); // 400
    }

    try {
      const user = await getUserByUserName(username);
      if (!user) {
        return next(throwErr("USER_NOT_FOUND")); // 404
      }

      req.userData = user;
      next();
    } catch (e) {
      return next(throwErr("INTERNAL_SERVER")); // 500
    }
  },
];
