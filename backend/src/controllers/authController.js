// Rejestracja, logowanie użytkowników
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import VALIDATION_RULES from "../middleware/validationConfig.js";
import ApiError from "../errors/ApiError.js";
// Obsługa użytkowników
import {
  createUser,
  getUserByUsername,
  getUserByUserName,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserByID,
  incrementUserActivity,
} from "../repositories/user.repo.js";

// Statystyki (ruch / logowanie)
import { updateLastLogin } from "../repositories/stats.repo.js";

// Ranking użytkowników
import { userRankingUpdate } from "../repositories/ranking.repo.js";

import {
  sendEmail,
  generateResetPasswordEmail,
} from "../services/email.service.js";
import { config } from "../config/config.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.TOKEN_KEY,
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
    throw new ApiError(400, "ERR_VALIDATION", "Validation failed", errors.array());
  }

  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  let newUserId;
  try {
    newUserId = await createUser(username, email, hashedPassword);
  } catch (err) {
    if (err.code === "23505") {
      throw new ApiError(409, "ERR_USER_EXISTS", "Username or email already exists");
    }
    throw new ApiError(500, "ERR_REGISTRATION", "An error occurred during registration.");
  }

  await userRankingUpdate(newUserId, username);
  const today = new Date().toISOString().slice(0, 10);
  await incrementUserActivity("registration", today);

  res.status(201).json({ success: true, userId: newUserId });
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

  const user = await getUserByUsername(username);
  if (!user) {
    throw new ApiError(401, "ERR_INVALID_CREDENTIALS", "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "ERR_INVALID_CREDENTIALS", "Invalid credentials");
  }

  await updateLastLogin(user.id);
  const today = new Date().toISOString().slice(0, 10);
  await incrementUserActivity("login", today);

  const token = generateToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
  });
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
  const userResult = await getUserByUserName(username);

  if (!userResult) {
    throw new ApiError(404, "ERR_USER_NOT_FOUND", "User not found");
  }

  res.status(200).json({
    success: true,
    message: "Data received",
    username: req.user.username,
    email: userResult.email,
    avatar: userResult.avatar,
  });
};

export const updateUserAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "ERR_VALIDATION", "Validation failed", errors.array());
  }

  const { username, email, oldPass, newPass, avatar } = req.body;
  const userId = req.user.id;

  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(404, "ERR_USER_NOT_FOUND", "User not found");
  }

  if (oldPass) {
    const isOldPassValid = await bcrypt.compare(oldPass, user.password);
    if (!isOldPassValid) {
      throw new ApiError(400, "ERR_INVALID_OLD_PASSWORD", "Old password is incorrect.");
    }
  }

  const hashedPassword = newPass ? await bcrypt.hash(newPass, 10) : undefined;
  await updateUserById(userId, {
    username: username || undefined,
    email: email || undefined,
    password: hashedPassword,
    avatar: avatar || undefined,
  });

  let newToken = null;
  if (email || hashedPassword) {
    newToken = generateToken({
      id: userId,
      username: username || user.username,
      email: email || user.email,
    });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });
  }

  res.status(200).json({
    success: true,
    message: "Account updated successfully!",
    token: newToken,
  });
};

export const deleteUserAccount = async (req, res) => {
  const userId = req.user.id;
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
};

export const sendUserResetLink = async (req, res) => {
  const { email, language = "en" } = req.body;

  const users = await getUserByEmail(email);
  const responseMessage = "INFO_RESET_EMAIL_SENT";

  if (users.length === 0) {
    return res.status(200).json({ message: responseMessage });
  }

  const user = users[0];
  const token = generateToken(user);
  const resetLink = `http://localhost:3000/reset-password/${token}`;
  const htmlContent = generateResetPasswordEmail(resetLink, language);
  const subject = language === "pl" ? "Resetowanie hasła" : "Password Reset";

  try {
    await sendEmail({
      to: email,
      subject,
      html: htmlContent,
    });
  } catch (err) {
    throw new ApiError(500, "ERR_RESET_SENDING_FAIL", "Error sending reset email");
  }

  res.status(200).json({ message: responseMessage });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(token, config.tokenKey);
  } catch (err) {
    throw new ApiError(400, "ERR_INVALID_TOKEN", "Token expired or invalid");
  }

  const userId = decoded.id;
  const hashedPassword = await bcrypt.hash(password, 10);
  await updateUserById(userId, { password: hashedPassword });

  res.status(200).json({ message: "Hasło zostało zmienione." });
};
