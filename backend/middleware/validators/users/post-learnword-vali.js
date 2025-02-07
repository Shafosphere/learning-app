const authorizeLearn = (req, res, next) => {
  const { wordId } = req.body;

  if (wordId === undefined) {
    return res.status(400).json({ message: "wordId is required." });
  }

  if (!Number.isInteger(wordId) || wordId <= 0) {
    return res
      .status(400)
      .json({ message: "Invalid wordId. It must be a positive integer." });
  }

  next();
};

export default authorizeLearn;
