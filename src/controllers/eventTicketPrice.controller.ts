import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

import {
  createTicketPrice,
  fetchTicketPricesByEvent,
  modifyTicketPrice,
  removeTicketPrice,
} from "../services/eventTicketPrice.service.js";

import { TicketType } from "../models/eventTicketPrice.model.js";

const isValidId = (value: unknown): value is number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

const isValidTicketType = (value: unknown): value is TicketType => {
  return (
    value === "regular" ||
    value === "vip" ||
    value === "student" ||
    value === "early_bird"
  );
};

export const createTicketPriceController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);
    const { type, price } = req.body;

    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id");
    }

    if (!isValidTicketType(type)) {
      throw new AppError(400, "Invalid ticket type");
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      throw new AppError(400, "Invalid price");
    }

    const ticketPrice = await createTicketPrice(eventId, type, numericPrice);

    res.status(201).json({
      message: "Ticket price created successfully",
      data: ticketPrice,
    });
  },
);

export const fetchTicketPricesController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);

    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id");
    }

    const ticketPrices = await fetchTicketPricesByEvent(eventId);

    res.status(200).json({
      message: "Ticket prices retrieved successfully",
      data: ticketPrices,
    });
  },
);

export const modifyTicketPriceController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);
    const type = req.params.type;
    const { price } = req.body;

    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id");
    }

    if (!isValidTicketType(type)) {
      throw new AppError(400, "Invalid ticket type");
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      throw new AppError(400, "Invalid price");
    }

    const ticketPrice = await modifyTicketPrice(eventId, type, numericPrice);

    res.status(200).json({
      message: "Ticket price updated successfully",
      data: ticketPrice,
    });
  },
);

export const removeTicketPriceController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);
    const type = req.params.type;

    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id");
    }

    if (!isValidTicketType(type)) {
      throw new AppError(400, "Invalid ticket type");
    }

    const ticketPrice = await removeTicketPrice(eventId, type);

    res.status(200).json({
      message: "Ticket price deleted successfully",
      data: ticketPrice,
    });
  },
);
