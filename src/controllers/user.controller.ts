import {
  fetchAllUsers,
  fetchUserById,
  registerUser,
  loginUser,
  modifyUser,
  removeUser,
} from "../services/user.service.js";
import { Request, Response, NextFunction } from "express";

export const fetchAllUsersController = async (req: Request, res: Response) => {
  try {
    const results = await fetchAllUsers();
    res.status(200).json({
      message: "Users retrieved successfully",
      data: results,
    });
  } catch (error) {
    console.error("Controller error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const fetchUserByIdController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const results = await fetchUserById(userId);
    res.status(200).json({
      message: "User retrieved successfully",
      data: results,
    });
  } catch (error: any) {
    console.error("Controller error fetching user:", error);
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const registerUserController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email, and password are required" });
      return;
    }

    const results = await registerUser(name, email, password);
    res.status(201).json({
      message: "User registered successfully",
      data: results,
    });
  } catch (error: any) {
    console.error("Controller error registering user:", error);
    if (error.message === "Email is already registered") {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Failed to register user" });
  }
};

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const results = await loginUser(email, password);
    res.status(200).json({
      message: "User logged in successfully",
      data: results,
    });
  } catch (error: any) {
    console.error("Controller error logging in user:", error);
    if (error.message === "Invalid email or password") {
      res.status(401).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Failed to log in" });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ message: "Name and email are required" });
      return;
    }

    const results = await modifyUser(userId, name, email);
    res.status(200).json({
      message: "User updated successfully",
      data: results,
    });
  } catch (error: any) {
    console.error("Controller error updating user:", error);
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const results = await removeUser(userId);
    res.status(200).json({
      message: "User deleted successfully",
      data: results,
    });
  } catch (error: any) {
    console.error("Controller error deleting user:", error);
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: "Failed to delete user" });
  }
};
