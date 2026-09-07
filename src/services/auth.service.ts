import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

import { AppError } from "../utils/AppError.js";

import {
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
} from "../models/refreshToken.model.js";

import { hashRefreshToken } from "../utils/refreshToken.js";

import { getUserByEmail } from "../models/user.model.js";

import bcrypt from "bcrypt";

export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await createRefreshToken(user.id, refreshTokenHash, expiresAt);

  const { password_hash, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken = await findRefreshToken(tokenHash);

    if (!storedToken) {
      throw new AppError(401, "Invalid or revoked refresh token");
    }

    await revokeRefreshToken(tokenHash);

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      role: payload.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      role: payload.role,
    });

    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await createRefreshToken(payload.userId, newRefreshTokenHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(401, "Invalid or expired refresh token");
  }
}

export async function logoutUser(refreshToken: string | undefined) {
  if (refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    await revokeRefreshToken(tokenHash);
  }
}