// Rejestracja, logowanie użytkowników
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import {
  createUser,
  getUserByUsername,
  updateLastLogin,
  getUserByUserName,
  getUserById,
  updateUserById,
  deleteUserByID,
  getUsersWithPagination,
  searchUserById,
  searchUserByEmail,
  searchUserByUsername,
} from "../models/userModel";

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
  res.status(200).json({ loggedIn: true, user: req.user });
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Pobieramy użytkownika na podstawie nazwy użytkownika
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Sprawdzamy, czy hasło jest poprawne
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Aktualizujemy czas ostatniego logowania
    await updateLastLogin(user.id);

    // Generujemy token JWT
    const token = generateToken(user);

    // Ustawienie ciasteczka z tokenem
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
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

  const { username, email, oldPass, newPass } = req.body;
  const userId = req.user.id;

  try {
    // Pobranie obecnych danych użytkownika
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sprawdzenie starego hasła, jeśli zostało podane
    if (oldPass && !(await bcrypt.compare(oldPass, user.password))) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hashowanie nowego hasła, jeśli zostało podane
    let hashedPassword = user.password;
    if (newPass) {
      hashedPassword = await bcrypt.hash(newPass, 10);
    }

    // Aktualizacja danych użytkownika
    const updatedUser = {
      username: username || user.username,
      email: email || user.email,
      password: hashedPassword,
    };

    await updateUserById(userId, updatedUser);

    // Generowanie nowego tokenu JWT
    const newToken = generateToken(updatedUser);

    // Ustawienie nowego tokenu w ciasteczku
    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000, // 1 godzina
    });

    res.status(200).json({
      success: true,
      message: "Account updated successfully!",
      token: newToken,
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update account." });
  }
};

export const deleteUserAccount = async (req, res) => {
  const userId = req.user.id;

  try {
    await deleteUserById(userId);

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
    console.error("Error deleting account:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete account." });
  }
};

export const getUsersList = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  try {
    const offset = (page - 1) * limit;
    console.log(
      `Fetching users for page: ${page}, limit: ${limit}, offset: ${offset}`
    );

    const users = await getUsersWithPagination(parseInt(limit), offset);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Server Error");
  }
};

export const updateUserById = async (user) => {
  const { id, username, email, role } = user;

  // Na razie jest to tylko szkielet funkcji - logika zostanie dodana później
  // Przykładowe zapytanie mogłoby wyglądać tak:
  /*
  await pool.query(
    "UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4",
    [username, email, role, id]
  );
  */
  console.log(
    `Updating user with id: ${id}, username: ${username}, email: ${email}, role: ${role}`
  );
};

export const searchUsers = async (req, res) => {
  const { query } = req.query;

  try {
    let result;

    if (!isNaN(query)) {
      // Jeśli query jest liczbą (wyszukiwanie po ID)
      result = await searchUserById(parseInt(query));
    } else if (query.includes("@")) {
      // Jeśli query jest emailem
      result = await searchUserByEmail(query);
    } else {
      // Jeśli query jest nazwą użytkownika (username)
      result = await searchUserByUsername(query);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    console.log("Search result:", result);
    res.json(result);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Server Error");
  }
};
