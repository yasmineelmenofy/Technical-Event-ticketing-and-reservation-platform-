import jwt from "jsonwebtoken";

export type JwtPayload = {
  userId: number;
  role: "customer" | "admin";
};

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

if (!accessTokenSecret) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, accessTokenSecret!, {
    expiresIn: "15m",
  });
}
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

if (!refreshTokenSecret) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, refreshTokenSecret!, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, accessTokenSecret!) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, refreshTokenSecret!) as JwtPayload;
}