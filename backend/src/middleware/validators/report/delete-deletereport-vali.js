import { param, validationResult } from "express-validator";
import { getReportById } from "../../../repositories/report.repo.js";
import { throwErr } from "../../../errors/throwErr.js";
import { getErrorParams } from "../../getErrorParams.js";

export const deleteReportValidator = [
  /* ─────────── REPORT ID EXISTS & IS INT ─────────── */
  param("id")
    .exists()
    .withMessage("ERR_REPORT_ID_REQUIRED")
    .isInt({ gt: 0 })
    .withMessage("ERR_REPORT_ID_INVALID"),

  /* ─────────── REPORT EXISTS IN DB ─────────── */
  param("id").custom(async (value) => {
    const report = await getReportById(value);
    if (!report) {
      throw new Error("ERR_REPORT_NOT_FOUND");
    }
    return true;
  }),

  /* ─────────── OBSŁUGA BŁĘDÓW WALIDACJI ─────────── */
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors = result.array().map((err) => ({
        field: err.param,
        message: err.msg, 
        params: getErrorParams(err.msg),
      }));
      return next(throwErr("VALIDATION", errors)); // klucz mapy ERRORS
    }
    next();
  },
];
