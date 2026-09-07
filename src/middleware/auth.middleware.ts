import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies.access_token;

  if (!token) {
    throw new AppError(401, "Authentication required");
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch {
    throw new AppError(401, "Invalid or expired access token");
  }
}