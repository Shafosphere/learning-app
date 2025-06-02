import { increasingEntrances } from "../repositories/stats.repo.js";
import { throwErr } from "../errors/throwErr.js";

export const countingEntries = async (req, res) => {
  const { page_name } = req.body;
  if (!page_name) {
    throwErr("INVALID_INPUT");
  }
  const today = new Date().toISOString().slice(0, 10);
  await increasingEntrances({ page_name, today });
  res.json({ success: true });
};
