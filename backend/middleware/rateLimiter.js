import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 5, // Maksymalnie 5 prób logowania na IP w ciągu 15 minut
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});
