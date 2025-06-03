import { throwErr } from "../../../errors/throwErr.js";

const authorizePatchAndLevel = (req, res, next) => {
  const { level, patchNumber } = req.body;

  // 1. Oba parametry muszą być podane
  if (patchNumber === undefined || level === undefined) {
    return next(throwErr("MISSING_PARAMS"));
  }

  // 2. Walidacja patchNumber: musi być liczbą całkowitą większą od 0 i mniejszą niż 1 000 000
  if (
    !Number.isInteger(patchNumber) ||
    patchNumber <= 0 ||
    patchNumber >= 1000000
  ) {
    return next(throwErr("INVALID_PATCH_NUMBER"));
  }

  // 3. Walidacja poziomu: tylko B2 lub C1
  if (level !== "B2" && level !== "C1") {
    return next(throwErr("INVALID_LEVEL"));
  }

  // 4. Wszystko poprawne
  next();
};

export default authorizePatchAndLevel;
