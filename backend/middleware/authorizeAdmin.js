const authorizeAdmin = (req, res, next) => {
  console.log("Authorizing admin access..."); // Log na początku autoryzacji admina

  if (req.user.role !== "admin") {
    console.log("Access denied. User is not an admin.");
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }

  console.log("User is an admin. Proceeding...");
  next(); // Kontynuacja przetwarzania żądania
};

export default authorizeAdmin;
