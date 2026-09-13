import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

import {
  createTicket,
  fetchTicketById,
  fetchTicketsByReservation,
  fetchTicketsByUser,
  removeTicket,
} from "../services/ticket.service.js";

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

export const createTicketController = asyncHandler(
  async (req: Request, res: Response) => {
    const { reservation_id, event_id, seat_id, type } = req.body;

    if (!isValidId(reservation_id)) {
      throw new AppError(400, "Invalid reservation id");
    }

    if (!isValidId(event_id)) {
      throw new AppError(400, "Invalid event id");
    }

    if (!isValidId(seat_id)) {
      throw new AppError(400, "Invalid seat id");
    }

    if (!isValidTicketType(type)) {
      throw new AppError(400, "Invalid ticket type");
    }

    const ticket = await createTicket(
      req.user!.userId,
      req.user!.role,
      Number(reservation_id),
      Number(event_id),
      Number(seat_id),
      type,
    );

    res.status(201).json({
      message: "Ticket created successfully",
      data: ticket,
    });
  },
);

export const fetchTicketByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);

    if (!isValidId(ticketId)) {
      throw new AppError(400, "Invalid ticket id");
    }

    const ticket = await fetchTicketById(
      ticketId,
      req.user!.userId,
      req.user!.role,
    );

    res.status(200).json({
      message: "Ticket retrieved successfully",
      data: ticket,
    });
  },
);

export const fetchTicketsByReservationController = asyncHandler(
  async (req: Request, res: Response) => {
    const reservationId = Number(req.params.reservationId);

    if (!isValidId(reservationId)) {
      throw new AppError(400, "Invalid reservation id");
    }

    const tickets = await fetchTicketsByReservation(
      reservationId,
      req.user!.userId,
      req.user!.role,
    );

    res.status(200).json({
      message: "Tickets retrieved successfully",
      data: tickets,
    });
  },
);

export const fetchTicketsByUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const tickets = await fetchTicketsByUser(req.user!.userId);

    res.status(200).json({
      message: "Tickets retrieved successfully",
      data: tickets,
    });
  },
);

export const removeTicketController = asyncHandler(
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);

    if (!isValidId(ticketId)) {
      throw new AppError(400, "Invalid ticket id");
    }

    const ticket = await removeTicket(
      ticketId,
      req.user!.userId,
      req.user!.role,
    );

    res.status(200).json({
      message: "Ticket deleted successfully",
      data: ticket,
    });
  },
);
