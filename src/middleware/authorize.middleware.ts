import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

type Role = "admin" | "customer";

export function authorize(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Unauthorized: No user found");
    }
    if (req.user.role !== role) {
      throw new AppError(403, "Forbidden: Insufficient permissions");
    }
    next();
  };
}
