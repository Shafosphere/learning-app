import ApiError from "../../../errors/ApiError.js";
import { throwErr } from "../../../errors/throwErr.js";

const authorizeData = (req, res, next) => {
  const { patchNumber, wordList } = req.body;

  // 1. Musi być przynajmniej jedno: patchNumber lub wordList
  if (patchNumber === undefined && wordList === undefined) {
    return next(throwErr("MISSING_PARAMS"));
  }

  // 2. Walidacja patchNumber: całkowity, 1–999999
  if (patchNumber !== undefined) {
    if (
      !Number.isInteger(patchNumber) ||
      patchNumber <= 0 ||
      patchNumber >= 1000000
    ) {
      return next(throwErr("INVALID_PATCH_NUMBER"));
    }
  }

  // 3. Walidacja wordList: niepusta tablica
  if (wordList !== undefined) {
    if (!Array.isArray(wordList) || wordList.length === 0) {
      return next(throwErr("INVALID_WORD_LIST"));
    }
  }

  // 4. Przekaż sterowanie dalej
  next();
};

export default authorizeData;
