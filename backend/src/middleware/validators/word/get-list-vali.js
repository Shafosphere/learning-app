import ApiError from "../../../errors/ApiError.js";

const authorizeList = (req, res, next) => {
  let { page = 1, limit = 50 } = req.query;

  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) {
    return next(
      new ApiError(
        400,
        "ERR_INVALID_PAGE",
        "Invalid page parameter. It must be a positive integer."
      )
    );
  }

  if (isNaN(limit) || limit < 1) {
    return next(
      new ApiError(
        400,
        "ERR_INVALID_LIMIT",
        "Invalid limit parameter. It must be a positive integer."
      )
    );
  }

  // Przekazujemy przerobione wartości dalej, jeśli potrzebne
  req.query.page = page;
  req.query.limit = limit;

  next();
};

export default authorizeList;
