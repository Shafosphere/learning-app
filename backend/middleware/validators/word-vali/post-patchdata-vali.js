const authorizePatchAndLevel = (req, res, next) => {
  const { level, patchNumber } = req.body;

  if (patchNumber === undefined || level === undefined) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Both patchNumber and level must be provided.",
    });
  }

  // Walidacja patchNumber, jeżeli został podany.
  if (patchNumber !== undefined) {
    if (
      !Number.isInteger(patchNumber) ||
      patchNumber <= 0 ||
      patchNumber >= 1000000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid patchNumber. It must be a positive integer.",
      });
    }
  }

  // Walidacja level, jeżeli zostało podane.
  if (level !== undefined) {
    // Zamiast `||`, użyj `&&`.
    if (level !== "B2" && level !== "C1") {
      return res.status(400).json({
        success: false,
        message: "Invalid level. Allowed values: B2 or C1.",
      });
    }
  }

  // Jeśli wszystkie warunki zostały spełnione, przekazujemy sterowanie dalej.
  next();
};

export default authorizePatchAndLevel;
