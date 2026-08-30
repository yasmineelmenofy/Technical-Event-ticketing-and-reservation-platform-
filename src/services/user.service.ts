import bcrypt from "bcrypt";
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";

const SALT_ROUNDS = 10;

export async function fetchAllUsers() {
  const users = await getAllUsers();
  return users.map(({ password_hash, ...safeUser }) => safeUser);
}

export async function fetchUserById(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new AppError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await createUser(name, email, passwordHash);

  const { password_hash, ...safeUser } = newUser;
  return safeUser;
}

export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password");
  }

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function modifyUser(userId: number, name: string, email: string) {
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  const emailOwner = await getUserByEmail(email);
  if (emailOwner && emailOwner.id !== userId) {
    throw new AppError(409, "Email is already registered");
  }

  const updatedUser = await updateUser(userId, name, email);
  const { password_hash, ...safeUser } = updatedUser;
  return safeUser;
}

export async function removeUser(userId: number) {
  const existingUser = await getUserById(userId);
  if (!existingUser) {
    throw new AppError(404, "User not found");
  }

  const deletedUser = await deleteUser(userId);
  const { password_hash, ...safeUser } = deletedUser;
  return safeUser;
}
