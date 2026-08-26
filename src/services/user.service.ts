import bcrypt from "bcrypt";
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
} from "../models/user.model.js"

const SALT_ROUNDS = 10;

export async function fetchAllUsers() {
  try {
    const users = await getAllUsers();
    return users.map(({ password_hash, ...safeUser }) => safeUser);
  } catch (error) {
    console.error("Service error fetching users:", error);
    throw error;
  }
}

export async function fetchUserById(userId: number) {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const { password_hash, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error("Service error fetching user by id:", error);
    throw error;
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await createUser(name, email, passwordHash);

    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  } catch (error) {
    console.error("Service error registering user:", error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!passwordMatches) {
      throw new Error("Invalid email or password");
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error("Service error logging in user:", error);
    throw error;
  }
}

export async function modifyUser(
  userId: number,
  name: string,
  email: string
) {
  try {
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const updatedUser = await updateUser(userId, name, email);
    const { password_hash, ...safeUser } = updatedUser;
    return safeUser;
  } catch (error) {
    console.error("Service error updating user:", error);
    throw error;
  }
}

export async function removeUser(userId: number) {
  try {
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const deletedUser = await deleteUser(userId);
    const { password_hash, ...safeUser } = deletedUser;
    return safeUser;
  } catch (error) {
    console.error("Service error deleting user:", error);
    throw error;
  }
}