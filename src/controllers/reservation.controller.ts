import {
  createReservation,
  fetchAllReservations,
  fetchReservationsByUser,
  fetchReservationById,
  modifyReservationStatus,
} from "../services/reservation.service.js";
import { Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidId = (value: unknown): value is number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

export const createReservationController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const eventId = req.body.event_id;
    if (!isValidId(eventId)) {
      throw new AppError(400, "Invalid event id ");
    }
    const reservation = await createReservation(userId, eventId);
    res.status(201).json({
      message: "Reservation created successfully",
      data: reservation,
    });
  },
);

export const fetchReservationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, event_id, sort, order, page, limit, fields } = req.query;

    const user = req.user!;

    const filters: {
      status?: "pending" | "confirmed" | "cancelled";
      event_id?: number;
    } = {};

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        (status !== "pending" &&
          status !== "confirmed" &&
          status !== "cancelled")
      ) {
        throw new AppError(400, "Invalid reservation status");
      }

      filters.status = status;
    }

    if (event_id !== undefined) {
      const parsedEventId = Number(event_id);

      if (!isValidId(parsedEventId)) {
        throw new AppError(400, "Invalid event id");
      }

      filters.event_id = parsedEventId;
    }

    let validatedSort: "id" | "created_at" | "status" = "id";

    let validatedOrder: "asc" | "desc" = "asc";

    if (sort !== undefined) {
      if (
        typeof sort !== "string" ||
        (sort !== "id" && sort !== "created_at" && sort !== "status")
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

      const allowedFields = [
        "id",
        "user_id",
        "event_id",
        "created_at",
        "status",
      ];

      for (const field of selectedFields) {
        if (!allowedFields.includes(field)) {
          throw new AppError(400, `Invalid field: ${field}`);
        }
      }
    }

    let reservations;

    if (user.role === "admin") {
      reservations = await fetchAllReservations(
        filters,
        validatedSort,
        validatedOrder,
        Page,
        Limit,
        selectedFields,
      );
    } else {
      reservations = await fetchReservationsByUser(
        user.userId,
        filters,
        validatedSort,
        validatedOrder,
        Page,
        Limit,
        selectedFields,
      );
    }

    res.status(200).json({
      message: "Reservations retrieved successfully",
      data: reservations,
    });
  },
);

export const fetchReservationByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const reservationId = Number(req.params.id);

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      throw new AppError(400, "Invalid reservation id");
    }

    const userId = req.user!.userId;
    const role = req.user!.role;

    const reservation = await fetchReservationById(reservationId, userId, role);

    res.status(200).json({
      message: "Reservation retrieved successfully",
      data: reservation,
    });
  },
);

export const modifyReservationStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const reservationId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      throw new AppError(400, "Invalid reservation id");
    }

    if (
      status !== "pending" &&
      status !== "confirmed" &&
      status !== "cancelled"
    ) {
      throw new AppError(400, "Invalid reservation status");
    }

    const userId = req.user!.userId;
    const role = req.user!.role;

    const reservation = await modifyReservationStatus(
      reservationId,
      userId,
      role,
      status,
    );

    res.status(200).json({
      message: "Reservation status updated successfully",
      data: reservation,
    });
  },
);
