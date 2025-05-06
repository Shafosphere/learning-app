import { validationResult } from "express-validator";
import { getUserById } from "../../../repositories/user.repo.js";
export const deleteUserValidator = [
  // Middleware do sprawdzenia, czy użytkownik istnieje
  async (req, res, next) => {
    const userId = req.user.id;

    try {
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
      next();
    } catch (error) {
      console.error("Error validating user:", error.message);
      res.status(500).json({ success: false, message: "Internal Server Error." });
    }
  }
];
