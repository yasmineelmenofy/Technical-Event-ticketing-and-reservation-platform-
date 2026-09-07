import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { refreshAccessToken } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";
import validator from "validator";
import { loginUser, logoutUser } from "../services/auth.service.js";

export const loginUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }
    if (!validator.isEmail(email)) {
      throw new AppError(400, "Invalid email format");
    }
    const { user, accessToken, refreshToken } = await loginUser(
      email,
      password,
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in successfully",
      data: user,
    });
  },
);

export const refreshAccessTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      throw new AppError(401, "Refresh token required");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshAccessToken(refreshToken);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Access and refresh tokens refreshed successfully",
    });
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;

    await logoutUser(refreshToken);

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Logged out successfully",
    });
  },
);
