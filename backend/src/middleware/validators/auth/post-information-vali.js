import { validationResult } from "express-validator";
// import { getUserByUserName } from "../../../repositories/userModel.js";
import { getUserByUserName } from "../../../repositories/user.repo.js";
export const getUserInformationValidator = [
  // Middleware do sprawdzenia, czy użytkownik istnieje
  async (req, res, next) => {
    const username = req.user.username;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required." });
    }

    try {
      const user = await getUserByUserName(username);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
      req.userData = user; // Przekazujemy dane użytkownika do `req`, aby uniknąć ponownego zapytania do bazy
      next();
    } catch (error) {
      console.error("Error validating user:", error.message);
      res.status(500).json({ success: false, message: "Internal Server Error." });
    }
  }
];
