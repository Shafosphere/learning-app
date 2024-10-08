// Rejestracja, logowanie użytkowników
import jwt from "jsonwebtoken";

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
