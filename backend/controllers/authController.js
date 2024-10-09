// Rejestracja, logowanie użytkowników
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { createUser, getUserByUsername, updateLastLogin } from "../models/userModel";


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