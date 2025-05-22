import ApiError from "../../../errors/ApiError.js";
const authorizePatchAndLevel = (req, res, next) => {
  const { level, patchNumber } = req.body;

  // Oba parametry muszą być podane
  if (patchNumber === undefined || level === undefined) {
    return next(
      new ApiError(
        403,
        "ERR_MISSING_PARAMS",
        "Access denied. Both patchNumber and level must be provided."
      )
    );
  }

  // Walidacja patchNumber: musi być liczbą całkowitą większą od 0 i mniejszą niż 1 000 000
  if (
    !Number.isInteger(patchNumber) ||
    patchNumber <= 0 ||
    patchNumber >= 1000000
  ) {
    return next(
      new ApiError(
        400,
        "ERR_INVALID_PATCH_NUMBER",
        "Invalid patchNumber. It must be a positive integer between 1 and 999999."
      )
    );
  }

  // Walidacja poziomu: tylko B2 lub C1
  if (level !== "B2" && level !== "C1") {
    return next(
      new ApiError(
        400,
        "ERR_INVALID_LEVEL",
        "Invalid level. Allowed values: B2 or C1."
      )
    );
  }

  // Wszystko poprawne
  next();
};

export default authorizePatchAndLevel;
