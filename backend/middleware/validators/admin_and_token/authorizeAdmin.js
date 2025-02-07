const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.log("Access denied. User is not an admin.");
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }

  next(); // Kontynuacja przetwarzania żądania
};

export default authorizeAdmin;
