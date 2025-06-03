import { param, validationResult } from "express-validator";
import { getUserById } from "../../../repositories/user.repo.js";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const deleteUserValidator = [
  /* ─────────── ID EXISTS & IS INT < 1_000_000 ─────────── */
  param("id")
    .exists({ checkFalsy: true })
    .withMessage("ERR_USER_ID_REQUIRED")
    .isInt({ gt: 0, lt: 1000000 })
    .withMessage("ERR_USER_ID_INVALID")
    .toInt(),

  /* ─────────── USER EXISTS IN DB ─────────── */
  param("id").custom(async (value) => {
    const user = await getUserById(value);
    if (!user) {
      throw new Error("ERR_USER_NOT_FOUND");
    }
    return true;
  }),

  /* ─────────── OBSŁUGA BŁĘDÓW WALIDACJI ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, // np. "ERR_USER_ID_INVALID" lub "ERR_USER_NOT_FOUND"
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors));
    }
    next();
  },
];
