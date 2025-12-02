import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // max 100 requests per IP
  message: "Too many requests from this IP, please try again later."
});
