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
    const { role, name, email, sort, order, page, limit, fields } = req.query;

    const filters: {
      role?: "customer" | "admin";
      name?: string;
      email?: string;
    } = {};
    if (role !== undefined) {
      if (typeof role !== "string") {
        throw new AppError(400, "Invalid role");
      }

      if (role !== "customer" && role !== "admin") {
        throw new AppError(400, "Invalid role");
      }

      filters.role = role;
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        throw new AppError(400, "Invalid name");
      }

      filters.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || email.trim() === "") {
        throw new AppError(400, "Invalid email");
      }

      filters.email = email.trim();
    }
    let validatedSort: "id" | "name" | "email" = "id";
    let validatedOrder: "asc" | "desc" = "asc";

    if (sort !== undefined) {
      if (
        typeof sort !== "string" ||
        (sort !== "id" && sort !== "name" && sort !== "email")
      ) {
        throw new AppError(400, "Invalid sort option");
      }

      validatedSort = sort;
    }

    if (order !== undefined) {
      if (typeof order !== "string" || (order !== "asc" && order !== "desc")) {
        throw new AppError(400, "Invalid order option");
      }

      validatedOrder = order;
    }
    let Page = 1;
    let Limit = 10;

    if (page !== undefined) {
      Page = Number(page);

      if (!Number.isInteger(Page) || Page <= 0) {
        throw new AppError(400, "Invalid page number");
      }
    }

    if (limit !== undefined) {
      Limit = Number(limit);

      if (!Number.isInteger(Limit) || Limit <= 0 || Limit > 100) {
        throw new AppError(400, "Invalid limit. Must be between 1 and 100");
      }
    }
    let selectedFields: string[] | undefined;

    if (fields !== undefined) {
      if (typeof fields !== "string") {
        throw new AppError(400, "Invalid fields parameter");
      }

      selectedFields = fields.split(",").map((field) => field.trim());

      const allowedFields = ["id", "name", "email", "role"];

      for (const field of selectedFields) {
        if (!allowedFields.includes(field)) {
          throw new AppError(400, `Invalid field: ${field}`);
        }
      }
    }

    const results = await fetchAllUsers(
      filters,
      validatedSort,
      validatedOrder,
      Page,
      Limit,
      selectedFields,
    );

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
