// Rejestracja, logowanie użytkowników
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import VALIDATION_RULES from "../middleware/validators/validationConfig.js";
import {
  createUser,
  getUserByUsername,
  updateLastLogin,
  getUserByUserName,
  getUserById,
  updateUserById,
  deleteUserByID,
  incrementUserActivity,
  getUserByEmail,
  userRankingUpdate,
} from "../models/userModel.js";
import { sendEmail, generateResetPasswordEmail } from "../emailService.js";
import { config } from "../config.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.REACT_APP_TOKEN_KEY,
    { expiresIn: "1h" }
  );
};

export const getRequirements = (req, res) => {
  res.status(200).json({
    success: true,
    validationRules: VALIDATION_RULES,
  });
};

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Użycie funkcji modelu do tworzenia użytkownika
    const newUserId = await createUser(username, email, hashedPassword);

    await userRankingUpdate(newUserId, username);
    // Zwiększ licznik rejestracji
    const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD
    await incrementUserActivity("registration", today);

    res.status(201).json({ success: true, userId: newUserId });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === "23505") {
      // Unikalne naruszenie - np. ten sam email lub nazwa użytkownika
      res.status(409).json({
        success: false,
        message: "Username or email already exists.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "An error occurred during registration.",
      });
    }
  }
};

export const adminWelcome = (req, res) => {
  res.json({
    success: true,
    message: "Welcome admin!",
  });
};

export const userWelcome = (req, res) => {
  res.status(200).json({
    loggedIn: true,
    user: req.user,
    expiresIn: req.user.expiresAt - Date.now(), // Czas pozostały w ms
  });
};
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Pobieramy użytkownika na podstawie nazwy użytkownika
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "ERR_INVALID_CREDENTIALS", // lub np. "ERR_INVALID_EMAIL"
        code: "ERR_INVALID_CREDENTIALS",
      });
    }

    // Sprawdzamy, czy hasło jest poprawne
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "ERR_INVALID_CREDENTIALS", // lub "ERR_INVALID_PASSWORD"
        code: "ERR_INVALID_CREDENTIALS",
      });
    }

    // Aktualizujemy czas ostatniego logowania
    await updateLastLogin(user.id);

    // Zwiększ licznik logowań
    const today = new Date().toISOString().slice(0, 10);
    await incrementUserActivity("login", today);

    // Generujemy token JWT
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600000, // 1 godzina
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login.",
    });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
    token: null, // Dodatkowe zerowanie tokena
  });
};

export const userInformation = async (req, res) => {
  const username = req.user.username;

  try {
    const userResult = await getUserByUserName(username);

    if (!userResult) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data received",
      username: req.user.username,
      email: userResult.email,
      avatar: userResult.avatar,
    });
  } catch (error) {
    console.error("Error fetching user information:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred on the server.",
    });
  }
};

export const updateUserAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, oldPass, newPass, avatar } = req.body;
  const userId = req.user.id;

  try {
    // Pobierz aktualne dane użytkownika
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Jeśli podano stare hasło, sprawdź jego poprawność
    if (oldPass) {
      const isOldPassValid = await bcrypt.compare(oldPass, user.password);
      if (!isOldPassValid) {
        return res.status(400).json({ message: "Old password is incorrect." });
      }
    }

    // Jeśli podano nowe hasło, zahaszuj je
    const hashedPassword = newPass ? await bcrypt.hash(newPass, 10) : undefined;

    // Zaktualizuj dane użytkownika
    await updateUserById(userId, {
      username: username || undefined,
      email: email || undefined,
      password: hashedPassword,
      avatar: avatar || undefined,
    });

    // Generuj nowy token JWT (tylko jeśli zaktualizowano email lub hasło)
    let newToken = null;
    if (email || hashedPassword) {
      newToken = generateToken({
        id: userId,
        username: username || user.username,
        email: email || user.email,
      });

      // Ustawienie nowego tokena w ciasteczku
      res.cookie("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 3600000, // 1 godzina
      });
    }

    res.status(200).json({
      success: true,
      message: "Account updated successfully!",
      token: newToken,
    });
  } catch (error) {
    console.error("Error updating account:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating your account.",
    });
  }
};

export const deleteUserAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    await deleteUserByID(userId);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      success: true,
      message: "Account deleted and logged out successfully.",
    });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete account.",
    });
  }
};

export const sendUserResetLink = async (req, res) => {
  const { email, language = "en" } = req.body;

  try {
    const users = await getUserByEmail(email);

    // Ukrywamy istnienie użytkownika – zawsze zwracamy ten sam komunikat
    const responseMessage = "INFO_RESET_EMAIL_SENT"; // Klucz tłumaczenia

    if (users.length === 0) {
      return res.status(200).json({ message: responseMessage });
    }

    const user = users[0];
    const token = generateToken(user);
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const htmlContent = generateResetPasswordEmail(resetLink, language);
    const subject = language === "pl" ? "Resetowanie hasła" : "Password Reset";

    await sendEmail({
      to: email,
      subject,
      html: htmlContent,
    });

    res.status(200).json({ message: responseMessage });
  } catch (error) {
    console.error("Error sending reset email:", error.message);
    res.status(500).json({
      message: "ERR_RESET_SENDING_FAIL", // Kod błędu
      code: "ERR_RESET_SENDING_FAIL",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  console.log(password);
  try {
    const decoded = jwt.verify(token, config.tokenKey);
    const userId = decoded.id;
    console.log(userId);

    const hashedPassword = await bcrypt.hash(password, 10);

    await updateUserById(userId, { password: hashedPassword });

    res.status(200).json({ message: "Hasło zostało zmienione." });
  } catch (error) {
    console.error("Błąd podczas resetowania hasła:", error);
    res.status(400).json({ message: "Token wygasł lub jest nieprawidłowy." });
  }
};
