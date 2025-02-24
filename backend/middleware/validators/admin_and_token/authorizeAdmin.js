const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.log("Access denied. User is not an admin.");
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
  console.log("Got Access, user is an admin.");
  next();
};

export default authorizeAdmin;
