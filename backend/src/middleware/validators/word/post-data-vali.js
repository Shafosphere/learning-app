import ApiError from "../../../errors/ApiError.js";
const authorizeData = (req, res, next) => {
  const { patchNumber, wordList } = req.body;

  // Musi być przynajmniej jedno: patchNumber lub wordList
  if (patchNumber === undefined && wordList === undefined) {
    return next(
      new ApiError(
        403,
        "ERR_MISSING_PARAMS",
        "Access denied. Either patchNumber or wordList must be provided."
      )
    );
  }

  // Walidacja patchNumber: całkowity, 1–999999
  if (patchNumber !== undefined) {
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
  }

  // Walidacja wordList: niepusta tablica
  if (wordList !== undefined) {
    if (!Array.isArray(wordList) || wordList.length === 0) {
      return next(
        new ApiError(
          400,
          "ERR_INVALID_WORD_LIST",
          "Invalid wordList. It must be a non-empty array."
        )
      );
    }
  }

  // Przekaż sterowanie dalej
  next();
};

export default authorizeData;
