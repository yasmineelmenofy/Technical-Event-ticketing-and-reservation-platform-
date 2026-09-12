import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import {
  createSeat,
  fetchSeatById,
  fetchSeatsByVenue,
  modifySeat,
  removeSeat,
} from "../services/seat.service.js";
import { Request, Response } from "express";

const isValidId = (value: unknown): value is number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

const isValidRow = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 10
  );
};

const isValidSection = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 50
  );
};

const isValidSeatNumber = (value: unknown): value is number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0;
};

export const createSeatController = asyncHandler(
  async (req: Request, res: Response) => {
    const { row, section, seat_number, venue_id } = req.body;

    if (!isValidRow(row)) {
      throw new AppError(
        400,
        "Invalid row. Must be a non-empty string with a maximum of 10 characters",
      );
    }

    if (!isValidSection(section)) {
      throw new AppError(
        400,
        "Invalid section. Must be a non-empty string with a maximum of 50 characters",
      );
    }

    if (!isValidId(venue_id)) {
      throw new AppError(400, "Invalid venue id");
    }

    if (!isValidSeatNumber(seat_number)) {
      throw new AppError(400, "Invalid seat number");
    }

    const seat = await createSeat(
      row.trim(),
      section.trim(),
      Number(seat_number),
      Number(venue_id),
    );

    res.status(201).json({
      message: "Seat created successfully",
      data: seat,
    });
  },
);

export const fetchSeatsByVenueController = asyncHandler(
  async (req: Request, res: Response) => {
    const venueId = Number(req.params.venueId);

    if (!isValidId(venueId)) {
      throw new AppError(400, "Invalid venue id");
    }

    const seats = await fetchSeatsByVenue(venueId);

    res.status(200).json({
      message: "Seats retrieved successfully",
      data: seats,
    });
  },
);

export const fetchSeatByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const seatId = Number(req.params.id);

    if (!isValidId(seatId)) {
      throw new AppError(400, "Invalid seat id");
    }

    const seat = await fetchSeatById(seatId);

    res.status(200).json({
      message: "Seat retrieved successfully",
      data: seat,
    });
  },
);

export const modifySeatController = asyncHandler(
  async (req: Request, res: Response) => {
    const seatId = Number(req.params.id);
    const { row, section, seat_number } = req.body;

    if (!isValidId(seatId)) {
      throw new AppError(400, "Invalid seat id");
    }

    if (!isValidRow(row)) {
      throw new AppError(
        400,
        "Invalid row. Must be a non-empty string with a maximum of 10 characters",
      );
    }

    if (!isValidSection(section)) {
      throw new AppError(
        400,
        "Invalid section. Must be a non-empty string with a maximum of 50 characters",
      );
    }

    if (!isValidSeatNumber(seat_number)) {
      throw new AppError(400, "Invalid seat number");
    }

    const seat = await modifySeat(
      seatId,
      row.trim(),
      section.trim(),
      Number(seat_number),
    );

    res.status(200).json({
      message: "Seat updated successfully",
      data: seat,
    });
  },
);

export const removeSeatController = asyncHandler(
  async (req: Request, res: Response) => {
    const seatId = Number(req.params.id);

    if (!isValidId(seatId)) {
      throw new AppError(400, "Invalid seat id");
    }

    const seat = await removeSeat(seatId);

    res.status(200).json({
      message: "Seat deleted successfully",
      data: seat,
    });
  },
);
