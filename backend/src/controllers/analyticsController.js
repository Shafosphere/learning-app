import { increasingEntrances } from "../repositories/stats.repo.js";
import ApiError from "../errors/ApiError.js";

export const countingEntries = async (req, res) => {
  const { page_name } = req.body;
  if (!page_name) {
    // to też przejdzie przez errorHandler
    throw new ApiError(400, "ERR_INVALID_INPUT", "page_name is required");
  }
  const today = new Date().toISOString().slice(0, 10);
  await increasingEntrances({ page_name, today });
  res.json({ success: true });
};