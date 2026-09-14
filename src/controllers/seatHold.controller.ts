import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

import {
  createSeatHold,
  fetchSeatHoldById,
  fetchSeatHoldsByReservation,
  removeSeatHold,
  fetchAvailableSeatsByEvent,
} from "../services/seatHold.service.js";
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
export const createSeatHoldController = asyncHandler(
  async (req: Request, res: Response) => {
    const { seat_id, event_id, reservation_id, type } = req.body;

    if (!isValidId(seat_id)) {
      throw new AppError(400, "Invalid seat id");
    }

    if (!isValidId(event_id)) {
      throw new AppError(400, "Invalid event id");
    }

    if (!isValidId(reservation_id)) {
      throw new AppError(400, "Invalid reservation id");
    }
    if (!isValidTicketType(type)) {
      throw new AppError(400, "Invalid ticket type");
    }

    const seatHold = await createSeatHold(
      req.user!.userId,
      Number(seat_id),
      Number(event_id),
      Number(reservation_id),
      type,
    );

    res.status(201).json({
      message: "Seat held successfully",
      data: seatHold,
    });
  },
);

export const fetchSeatHoldByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const seatHoldId = Number(req.params.id);

    if (!isValidId(seatHoldId)) {
      throw new AppError(400, "Invalid seat hold id");
    }

    const userId = req.user!.userId;

    const seatHold = await fetchSeatHoldById(seatHoldId, userId);

    res.status(200).json({
      message: "Seat hold retrieved successfully",
      data: seatHold,
    });
  },
);

export const fetchSeatHoldsByReservationController = asyncHandler(
  async (req: Request, res: Response) => {
    const reservationId = Number(req.params.reservationId);

    if (!isValidId(reservationId)) {
      throw new AppError(400, "Invalid reservation id");
    }

    const userId = req.user!.userId;

    const seatHolds = await fetchSeatHoldsByReservation(reservationId, userId);

    res.status(200).json({
      message: "Seat holds retrieved successfully",
      data: seatHolds,
    });
  },
);

export const removeSeatHoldController = asyncHandler(
  async (req: Request, res: Response) => {
    const seatHoldId = Number(req.params.id);

    if (!isValidId(seatHoldId)) {
      throw new AppError(400, "Invalid seat hold id");
    }

    const userId = req.user!.userId;

    const seatHold = await removeSeatHold(seatHoldId, userId);

    res.status(200).json({
      message: "Seat hold removed successfully",
      data: seatHold,
    });
  },
);

export const fetchAvailableSeatsByEventController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId = Number(req.params.eventId);

    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id");
    }

    const seats = await fetchAvailableSeatsByEvent(eventId);

    res.status(200).json({
      message: "Available seats retrieved successfully",
      data: seats,
    });
  },
);
