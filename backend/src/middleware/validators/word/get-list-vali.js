import { throwErr } from "../../../errors/throwErr.js";

const authorizeList = (req, res, next) => {
  let { page = 1, limit = 50 } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) {
    return next(throwErr("INVALID_PAGE"));
  }

  if (isNaN(limit) || limit < 1) {
    return next(throwErr("INVALID_LIMIT"));
  }

  // Przekazujemy przerobione wartości dalej, jeśli potrzebne
  req.query.page = page;
  req.query.limit = limit;

  next();
};

export default authorizeList;