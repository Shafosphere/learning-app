const allowedPageNames = ["flashcards", "vocabulary_C1", "vocabulary_B2"];

export const validatePageName = (req, res, next) => {
  const { page_name } = req.body;

  if (!page_name) {
    return res.status(400).json({
      success: false,
      message: "Brakuje parametru 'page_name' w treści żądania.",
    });
  }

  if (!allowedPageNames.includes(page_name)) {
    return res.status(400).json({
      success: false,
      message: `Nieprawidłowa wartość 'page_name'. Dozwolone wartości to: ${allowedPageNames.join(
        ", "
      )}.`,
    });
  }

  next();
};