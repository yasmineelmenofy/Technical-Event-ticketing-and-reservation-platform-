import { Request, Response } from "express";
import {
  fetchAllUsers,
  fetchUserById,
  registerUser,
  loginUser,
  modifyUser,
  removeUser,
} from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import validator from "validator";
export const fetchAllUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    const results = await fetchAllUsers();
    res.status(200).json({
      message: "Users retrieved successfully",
      data: results,
    });
  },
);

export const fetchUserByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      throw new AppError(400, "Invalid user id");
    }
    const results = await fetchUserById(userId);

    res.status(200).json({
      message: "User retrieved successfully",
      data: results,
    });
  },
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError(400, "Name, email, and password are required");
    }
    if (!validator.isEmail(email)) {
      throw new AppError(400, "Invalid email format");
    }

    const results = await registerUser(name, email, password);
    res.status(201).json({
      message: "User registered successfully",
      data: results,
    });
  },
);

export const loginUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }
    if (!validator.isEmail(email)) {
      throw new AppError(400, "Invalid email format");
    }

    const results = await loginUser(email, password);
    res.status(200).json({
      message: "User logged in successfully",
      data: results,
    });
  },
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      throw new AppError(400, "Invalid user id");
    }
    const { name, email } = req.body;

    if (!name || !email) {
      throw new AppError(400, "Name and email are required");
    }
    if (!validator.isEmail(email)) {
      throw new AppError(400, "Invalid email format");
    }

    const results = await modifyUser(userId, name, email);
    res.status(200).json({
      message: "User updated successfully",
      data: results,
    });
  },
);

export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      throw new AppError(400, "Invalid user id");
    }
    const results = await removeUser(userId);
    res.status(200).json({
      message: "User deleted successfully",
      data: results,
    });
  },
);
